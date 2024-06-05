/* The Help pop-up window exported as HelpModal and the text content within */

import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions } from "react-native";
import { styles } from "./styles";

// Store help content in form of arrays of objects
const ctrl_helps = [
  {title: "Shift", content: `Toggle the content of some buttons.`},
  {title: "Radian", content: `Toggle whether to use degree (OFF) or radian (ON) as the unit when applying trigonometric functions.`},
  {title: "a/b/c", content: `Toggle whether to use improper fraction (OFF) or mixed fraction (ON) to display fractional solutions.`},
];
const program_helps = [
  {title: "Program", content: `Define or use programs or functions.`},
  {title: "History", content: `Check past calculation formula and solution.`},
  {title: "Constant", content: `Bring more constants other than π and e to the calculation.`},
];
const func_helps = [
  {title: "/ Slash", content: `A slash separates a fraction into its numerator, denominator, and whole number part depending on context.\nImproper fraction:\nd/c = d ÷ c\nMixed fraction:\na/b/c = a + b ÷ c`},
  {title: "√ Square Root", content: "Calculate the square root of a number.\nFormat: √(a)"}
];

// Create each row in a HelpTable
// Props: title, content
const HelpRow = (props) => {
  return (
    <View style={styles.help_row_container}>
      <View style={styles.help_row_left}>
        <Text style={styles.help_row_title}>{props.title}</Text>
      </View>
      <View style={styles.help_row_right}>
        <Text style={styles.help_row_content}>{props.content}</Text>
      </View>
    </View>
  )
}

// Create a table for each classification of help content
// Props: title, list
const HelpTable = (props) => {
  return (
    <View>
      <Text style={styles.help_small_title}>{props.title}</Text>
      {props.list.map((item, index) => {
        return (<HelpRow key={index} title={item.title} content={item.content}/>)
      })}
    </View>
  )
}

// Create the static Help Screen (Modal)
// Props: style, visible
export default HelpModal = (props) => {
  let window_height = Dimensions.get("window").height;
  return (
    <Modal visible={props.visible} transparent={true} animationType="slide">
      <View style={[styles.help_container, {height: window_height * 0.9}]}>
        <Text style={styles.help_title}>Help</Text>
        <ScrollView>
          <HelpTable title="Control Switches" list={ctrl_helps}/>
          <HelpTable title="Program Buttons" list={program_helps}/>
          <HelpTable title="Functions" list={func_helps}/>
        </ScrollView>
        <View style={{justifyContent: "center", alignContent: "center", alignSelf: "center"}}>
          <TouchableOpacity style={styles.help_close_btn} onPress={props.onCloseClicked}>
            <Text style={styles.help_close_text}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}