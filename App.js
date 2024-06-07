/* Main program of the Mobile Calculator with state control and GUI structure of the calculator */

import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { color, styles } from "./src/styles.js";
import { Block, CtrlSwitch, FormulaBtn, ArbitBtn, TriangleUp, TriangleDown, TriangleLeft, TriangleRight, ProgramBtn, Circle } from './src/components.js';
import { mathToString, readNumBlock, evaluateFormula } from './src/calculation.js';
import HelpModal from './src/HelpModal.js';
import HistModal from './src/HistModal.js';

export default function MobileCalculator() {
  // Global const lists
  const unshifted_list = ["sin", "cos", "tan", "sec", "csc", "cot", "log", "ln", "(-)"]; // Functions before shift is enabled
  const shifted_list = ["arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot", "10^", "e^", "%"]; // Functions after shift is enabled

  // React useState
  // useState -> automatically rendered object (changing display)
  const [blocks, setBlocks] = useState([]); // Formula display components
  const [answer, setAnswer] = useState(0); // Answer value
  const [ansStr, setAnsStr] = useState("0"); // Answer display component
  const [position, setPosition] = useState(0); // Index of the currently pointing box for del, concat's positioning (TODO: allow edition in the middle)
  const [executed, setExecuted] = useState(false);

  const [shiftEnabled, setShift] = useState(false); // Whether shift mode is on (change of some formula button)
  const [shiftBtnList, setShiftBtnList] = useState([...unshifted_list]); // Functions affected by shift enabled or not
  const [radianEnabled, setRadian] = useState(false); // Which unit is used to evaluate trigo functions, degree or radian
  const [mixedFract, setMixedFract] = useState(false); // Whether to display fractional solution in form of d/c or a/b/c (d/c == a/b/c)

  const [showHelp, setShowHelp] = useState(false); // Whether to show the "Help" screen (Modal)

  const MaxHistCount = 20;
  const [showHist, setShowHist] = useState(false); // Whether to show the "History" screen (Modal)
  const [history, setHistory] = useState([]); // History of calculation: an array of objects
  // const [constants, setConstants] = useState([]); // List of constants which are defined by users

  // React useEffect
  // On initial render, loadSettings and loadHistory
  useEffect(() => {
    loadSettings();
    loadHistory();
    loadAns();
  }, []);

  // On changes of shiftEnabled, radianEnabled, mixedFract -> saveSettings
  useEffect(() => {
    saveSettings();
  }, [shiftEnabled, radianEnabled, mixedFract]);

  // On change of answer -> saveAns
  useEffect(() => {
    saveAns();
  }, [answer]);

  // On changes of history -> saveHistory
  useEffect(() => {
    saveHistory();
  }, [history]);

  // Pop up error alert
  const showAlert = (error_title, error_msg) => {
    Alert.alert(error_title, error_msg, [{text: "OK", onPress: () => console.log("Error alert seen.")}]);
  }

  /* 
    AsyncStorage Notes:

    key for settings: "settings"
    structure for settings: {shift: shiftEnabled, radian: radianEnabled, mixed_fract: mixedFract}

    key for answer: "answer"
    structure for answer: stringified mathjs obj

    key for history: "history"
    structure for history: [{formula: formula_str, answer: answer_str}, ...]
  */

  // Update the settings stored in storage when user edited the settingss (switches)
  const saveSettings = async () => {
    // Turn all settingss into JSON
    let settings_obj = {shift: shiftEnabled, radian: radianEnabled, mixed_fract: mixedFract};
    let settings_json = JSON.stringify(settings_obj);
    // Save
    try {
      await AsyncStorage.setItem("settings", settings_json);
    }
    catch (e) {
      showAlert("Program Error", "Failed to save current settings.");
    }
  }

  // Edit settings recorded in the storage
  const loadSettings = async () => {
    try {
      // Load
      const record_json = await AsyncStorage.getItem("settings");
      // If it does not exist, no action have to be done (use default)
      if (record_json != null) {
        // If it exists, parse into obj
        let record_obj = JSON.parse(record_json);
        setShift(record_obj.shift);
        setRadian(record_obj.radian);
        setMixedFract(record_obj.mixed_fract);
      }
    }
    catch (e) {
      showAlert("Program Error", "Failed to load settings.");
    }
  }

  // Save the current answer to storage
  const saveAns = async () => {
    // Turn current answer into JSON
    let answer_json = JSON.stringify(mathToString(answer));
    // Save
    try {
      await AsyncStorage.setItem("answer", answer_json);
    }
    catch (e) {
      showAlert("Program Error", "Failed to save current answer.");
    }
  }
  
  // Load the past answer from storage
  const loadAns = async () => {
    try {
      // Load
      const record_json = await AsyncStorage.getItem("answer");
      // If it does not exist, no action have to be done (use default)
      if (record_json != null) {
        // If it exists, parse into mathjs obj
        let record_obj = JSON.parse(record_json);
        record_obj = readNumBlock(record_obj, true);
        setAnswer(record_obj);
      }
    }
    catch (e) {
      showAlert("Program Error", "Failed to load answer.");
    }
  }

  // Update the current history array (max. 20 formula) to storage
  const saveHistory = async () => {
    // Turn history array into JSON
    let history_json = JSON.stringify(history);
    // Save
    try {
      await AsyncStorage.setItem("history", history_json);
    }
    catch (e) {
      showAlert("Program Error", "Failed to save current history.");
    }
  }

  // Load the histroy array from storage
  const loadHistory = async () => {
    try {
      // Load
      const record_json = await AsyncStorage.getItem("history");
      // If it does not exist, no action have to be done (leave it empty)
      if (record_json != null) {
        let record_obj = JSON.parse(record_json);
        setHistory(record_obj);
      }
    }
    catch (e) {
      showAlert("Program Error", "Failed to load history.");
    }
  }

  // Remove the indicated index from the history array
  const removeHistory = (index) => {
    if (history.length > 0) {
      setHistory([...history.slice(0, index).concat(history.slice(index+1))]);
    }
    else {
      showAlert("Program Error", "Failed to dequeue when array is empty.");
    }
  }

  // Add the current formula to history array
  const addToHistory = (block_obj, answer_str) => {
    let temp = history;
    // Remove first history if necessary
    if (history.length > MaxHistCount-1) {
      temp = history.slice(1);
    }
    // Append to history
    setHistory([...temp, {formula: block_obj, answer: answer_str}]);
  }

  // Use formula and answer from history
  const useHistory = (index) => {
    let block_obj = history[index].formula;
    let answer_obj = history[index].answer
    setBlocks(block_obj);
    setAnswer(answer_obj);
    setAnsStr(mathToString(answer_obj));
    setShowHist(false);
  }

  // Edit the formula on press
  const concatPressed = (char) => {
    // Some char should display differently
    const map = {"(-)": "-"};
    let mapped_char = char;
    if (map.hasOwnProperty(char)) {
      mapped_char = map[char];
    }
    // Respond differently depending on the current state: during edition or after execution
    if (executed) {
      const sticky_ans_list = ["+", "-", "×", "÷", ")", "/"];
      if (sticky_ans_list.includes(char)) {
        setBlocks(["Ans", mapped_char]);
        setPosition(2);
      }
      else {
        setBlocks([mapped_char]);
        setPosition(1);
      }
      setExecuted(false);
    }
    else {
      setBlocks([...blocks.slice(0, position), mapped_char, ...blocks.slice(position)]);
      // setBlocks((prev_blocks) => [...prev_blocks, mapped_char]);
      setPosition(position+1);
    }
  }

  // Delete the last character in the formula on press of DEL
  const delPressed = () => {
    if (!executed) {
      if (position != 0) {
        setBlocks([...blocks.slice(0, position-1), ...blocks.slice(position)]);
        setPosition(position-1);
      }
    }
  }

  // Clear the whole formula on press of AC
  const acPressed = () => {
    setAnsStr("0");
    setExecuted(false);
    setBlocks([]);
    setPosition(0);
  }

  // Execute the formula, call functions to calculate and display the answer
  const exePressed = () => {
    let block_obj = blocks;
    let formula_str = block_obj.join("");
    let result = evaluateFormula(formula_str, radianEnabled, mixedFract, answer);
    if (result.hasOwnProperty("error_title")) { // Manage Error
      showAlert(result.error_title, result.error_msg);
      setAnsStr("0");
      setBlocks([]);
      setPosition(0);
      setExecuted(false);
    }
    else {
      let answer_str = mathToString(result);
      setAnswer(result);
      setAnsStr(answer_str);
      setExecuted(true);
      addToHistory(block_obj, answer_str);
    }
  }

  // Shift position to left by 1 block
  const leftPressed = () => {
    if (executed) {
      setExecuted(false);
      setPosition(blocks.length);
    }
    else {
      if (position > 0) {
        setPosition(position-1);
      }
    }
  }

  // Shift position to right by 1 block
  const rightPressed = () => {
    if (executed) {
      setExecuted(false);
      setPosition(blocks.length);
    }
    else {
      if (position < blocks.length) {
        setPosition(position+1);
      }
    }
  }

  // Toggle shift mode
  const shiftToggled = () => {
    // Note: effect of setShift takes place only after ending this function, thus the conditions have to be reversed
    setShift(prev_state => !prev_state);
    // Now is not shifted i.e. going to be shifted -> generate orange button
    if (!shiftEnabled) {
      setShiftBtnList([...shifted_list]);
    }
    // Now is shifted i.e. going to be not shifted -> generate grey button
    else {
      setShiftBtnList([...unshifted_list]);
    }
  }

  // Toggle the unit: degree or radian
  const radianToggled = () => {
    setRadian(prev_state => !prev_state);
  }

  // Toggle whether to use improper fraction or mixed fraction
  const mixedFractToggled = () => {
    setMixedFract(prev_state => !prev_state);
  }
  

  // GUI STRUCTURE
  return (
    <SafeAreaView style={styles.environment}>
			{/* <View style={styles.sidebar}>

			</View> */}
			<View style={styles.main}>
        {/* Modals */}
        <HelpModal visible={showHelp} onCloseClicked={() => setShowHelp(false)}/>
        <HistModal visible={showHist} data={history} onCloseClicked={() => setShowHist(false)} onUse={(index) => useHistory(index)} onRemove={(index) => removeHistory(index)}/>
        {/* Upper Container */}
				<View style={styles.upper_container}>
					<View style={styles.display_screen}>
						<View style={styles.input_row}>
              <ScrollView horizontal ref={ref => {this.scrollView = ref}} onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
                <Block style={{borderRightWidth: (position === 0 && !executed) ? 2 : 0}} text=""></Block>
                {blocks.map((block, index) => {
                  let width = 0;
                  if (position-1 === index && !executed) {
                    width = 2;
                  }
                  return (<Block style={{borderRightWidth: width}} key={index} text={block}/>);
                })}
              </ScrollView>
						</View>
						<View style={styles.output_row}>
							<Text style={styles.output_ans}>{ansStr}</Text>
						</View>
					</View>
				</View>
        {/* Middle Container */}
        <View style={styles.mid_container}>
          {/* Left Control Panel */}
          <View style={styles.mid_subcontainer}>
            <CtrlSwitch style={{borderBottomWidth: 2}} text="Shift" onValueChange={() => {shiftToggled()}} value={shiftEnabled}/>
            <CtrlSwitch style={{borderBottomWidth: 2}} text="Radian" onValueChange={() => {radianToggled()}} value={radianEnabled}/>
            <CtrlSwitch text="a/b/c" onValueChange={() => {mixedFractToggled()}} value={mixedFract}/>
          </View>
          {/* Arrow Pad */}
          <View style={styles.mid_subcontainer}>
            <View style={styles.mid_row}>
              <View style={styles.mid_row_side}></View>
              <TouchableOpacity style={styles.mid_row_center}>
                <TriangleUp></TriangleUp>
              </TouchableOpacity>
              <View style={styles.mid_row_side}></View>
            </View>
            <View style={styles.mid_large_row}>
              <TouchableOpacity style={styles.mid_column} onPress={() => leftPressed()}>
                <TriangleLeft></TriangleLeft>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mid_large_column} onPress={() => setShowHelp(true)}>
                <Circle>
                  <Text style={styles.info_text}>Help</Text>
                </Circle>
                
              </TouchableOpacity>
              <TouchableOpacity style={styles.mid_column} onPress={() => rightPressed()}>
                <TriangleRight></TriangleRight>
              </TouchableOpacity>
            </View>
            <View style={styles.mid_row}>
              <View style={styles.mid_row_side}></View>
              <TouchableOpacity style={styles.mid_row_center}>
                <TriangleDown></TriangleDown>
              </TouchableOpacity>
              <View style={styles.mid_row_side}></View>
            </View>
          </View>
          {/* Right Control Panel */}
          <View style={styles.mid_subcontainer}>
            <ProgramBtn text="Program"/>
            <ProgramBtn text="History" onPress={() => setShowHist(true)}/>
            <ProgramBtn text="Constant"/>
          </View>
        </View>
        {/* Lower Container */}
				<View style={styles.lower_container}>
					<View style={styles.btn_container}>
            <View style={styles.btn_row}>
              <FormulaBtn onPress={() => concatPressed("/")} fixed={true} text="/"/>
              <FormulaBtn onPress={() => concatPressed("√(")} fixed={true} text="√"/>
              <FormulaBtn onPress={() => concatPressed("²")} fixed={true} text="x²"/>
              <FormulaBtn onPress={() => concatPressed("^(")} fixed={true} text="^"/>
              <FormulaBtn onPress={() => concatPressed("x√(")} fixed={true} text="x√"/>
              <FormulaBtn onPress={() => concatPressed("!")} fixed={true} text="!"/>
						</View>
						<View style={styles.btn_row}>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[0]+"(")} fixed={false} shifted={shiftEnabled} text={shiftBtnList[0]}/>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[1]+"(")} fixed={false} shifted={shiftEnabled} text={shiftBtnList[1]}/>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[2]+"(")} fixed={false} shifted={shiftEnabled} text={shiftBtnList[2]}/>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[3]+"(")} fixed={false} shifted={shiftEnabled} text={shiftBtnList[3]}/>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[4]+"(")} fixed={false} shifted={shiftEnabled} text={shiftBtnList[4]}/>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[5]+"(")} fixed={false} shifted={shiftEnabled} text={shiftBtnList[5]}/>
						</View>
						<View style={styles.btn_row}>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[6]+"(")} fixed={false} shifted={shiftEnabled} text={shiftBtnList[6]}/>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[7]+"(")} fixed={false} shifted={shiftEnabled} text={shiftBtnList[7]}/>
              <FormulaBtn onPress={() => concatPressed(shiftBtnList[8])} fixed={false} shifted={shiftEnabled} text={shiftBtnList[8]}/>
              <FormulaBtn onPress={() => concatPressed("(")} fixed={true} text="("/>
              <FormulaBtn onPress={() => concatPressed(")")} fixed={true} text=")"/>
              <FormulaBtn onPress={() => concatPressed(",")} fixed={true} text=","/>
						</View>
					</View>
					<View style={styles.btn_container}>
						<View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("7")} text="7"/>
              <ArbitBtn onPress={() => concatPressed("8")} text="8"/>
              <ArbitBtn onPress={() => concatPressed("9")} text="9"/>
              <ArbitBtn onPress={() => delPressed()} text="DEL"/>
              <ArbitBtn onPress={() => acPressed()} text="AC"/>
						</View>
						<View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("4")} text="4"/>
              <ArbitBtn onPress={() => concatPressed("5")} text="5"/>
              <ArbitBtn onPress={() => concatPressed("6")} text="6"/>
              <ArbitBtn onPress={() => concatPressed("×")} text="×"/>
              <ArbitBtn onPress={() => concatPressed("÷")} text="÷"/>
						</View>
						<View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("1")} text="1"/>
              <ArbitBtn onPress={() => concatPressed("2")} text="2"/>
              <ArbitBtn onPress={() => concatPressed("3")} text="3"/>
              <ArbitBtn onPress={() => concatPressed("+")} text="+"/>
              <ArbitBtn onPress={() => concatPressed("-")} text="-"/>
						</View>
						<View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("0")} text="0"/>
              <ArbitBtn onPress={() => concatPressed(".")} text="."/>
              <ArbitBtn onPress={() => concatPressed("E")} text="EXP"/>
              <ArbitBtn onPress={() => concatPressed("Ans")} text="Ans"/>
              <ArbitBtn onPress={() => exePressed()} text="EXE"/>
						</View>
            <View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("π")} text="π"/>
              <ArbitBtn onPress={() => concatPressed("e")} text="e"/>
              {/* Fillers */}
              <View style={{flex: 1, height: 50, margin: 2, borderRadius: 6, borderWidth: 2, borderColor: color.background, justifyContent: "center", alignItems: "center"}}></View>
              <View style={{flex: 1, height: 50, margin: 2, borderRadius: 6, borderWidth: 2, borderColor: color.background, justifyContent: "center", alignItems: "center"}}></View>
              <View style={{flex: 1, height: 50, margin: 2, borderRadius: 6, borderWidth: 2, borderColor: color.background, justifyContent: "center", alignItems: "center"}}></View>
						</View>
					</View>
          <View style={styles.var_record_box}>
            <Text style={styles.var_record}>Ans: {mathToString(answer)}</Text>
          </View>
				</View>
			</View>
		</SafeAreaView>
  );
}