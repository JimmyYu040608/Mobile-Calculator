import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View, SafeAreaView, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { color, styles } from "./src/styles.js";
import { Block, CtrlSwitch, FormulaBtn, ArbitBtn, TriangleUp, TriangleDown, TriangleLeft, TriangleRight, ProgramBtn, Circle } from './src/components.js';
import { mathToString, evaluateFormula } from './src/calculation.js';

export default function MobileCalculator() {
  // Global const lists
  const unshifted_list = ["sin", "cos", "tan", "sec", "csc", "cot", "log", "ln", "(-)"]; // Functions before shift is enabled
  const shifted_list = ["arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot", "10^", "e^", "%"]; // Functions after shift is enabled

  // "Global variables"
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

  // Pop up error alert
  const showAlert = (error_title, error_msg) => {
    Alert.alert(error_title, error_msg, [{text: "OK", onPress: () => console.log("Error alert seen.")}]);
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
    let formula_str = blocks.join("");
    let result = evaluateFormula(formula_str, radianEnabled, mixedFract);
    if (result.hasOwnProperty("error_title")) { // Manage Error
      showAlert(result.error_title, result.error_msg);
      setAnsStr("0");
      setBlocks([]);
      setPosition(0);
      setExecuted(false);
    }
    else {
      setAnswer(result);
      setAnsStr(mathToString(result));
      setExecuted(true);
    }
  }

  // Shift position to left by 1 block
  const leftPressed = () => {
    if (position > 0 && !executed) {
      setPosition(position-1);
    }
  }

  // Shift position to right by 1 block
  const rightPressed = () => {
    if (position < blocks.lengt && !executed) {
      setPosition(position+1);
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

  // Open up Help window
  const openHelp = () => {

  }

  // GUI STRUCTURE
  return (
    <SafeAreaView style={styles.environment}>
			{/* <View style={styles.sidebar}>

			</View> */}

			<View style={styles.main}>
        {/* Upper Container */}
				<View style={styles.upper_container}>
					<View style={styles.display_screen}>
						<View style={styles.input_row}>
              <ScrollView horizontal ref={ref => {this.scrollView = ref}} onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
                <Block style={{borderRightWidth: position === 0 ? 2 : 0}} key={0} text=""></Block>
                {blocks.map((block, index) => {
                  return (<Block style={{borderRightWidth: position-1 === index ? 2 : 0}} key={index} text={block}/>)
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
              <TouchableOpacity style={styles.mid_large_column} onPress={() => openHelp()}>
                <Circle>
                  <Text style={styles.info_text}></Text>
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
            <ProgramBtn text="Programs"/>
            <ProgramBtn text="History"/>
            <ProgramBtn text="Constants"/>
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
				</View>
			</View>
		</SafeAreaView>
  );
}