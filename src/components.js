/* Modularized components to be used in the main App.js */

import { View, Text, TouchableOpacity, Switch, Modal, ScrollView, Dimensions } from "react-native";
import { color, styles } from "./styles";

// Create blocks for a formula
// Props: style, text
export const Block = (props) => {
  return (
    <View style={[props.style, styles.block]}>
      <Text style={styles.block_text}>{props.text}</Text>
    </View>
  );
}

// Switches to toggle calculation settings
// Props: style, onValueChange, value, text
export const CtrlSwitch = (props) => {
  return (
    <View style={[props.style, styles.ctrl_view]}>
      <Text style={styles.ctrl_text}>{props.text}</Text>
      <Switch style={styles.ctrl_switch} onValueChange={props.onValueChange} value={props.value}></Switch>
    </View>
  );
}

// Long orange buttons in middle part
// Props: style, onPress, text
export const ProgramBtn = (props) => {
  return (
    <TouchableOpacity style={[props.style, styles.program_btn_view]}>
      <Text style={styles.program_btn_text}>{props.text}</Text>
    </TouchableOpacity>
  );
}

// Small (grey or orange) buttons in the lower part for different functions
// Props: style, onPress, fixed, shifted, text
export const FormulaBtn = (props) => {
  let btn_color = color.primary;
  if (!props.fixed && props.shifted) {
    btn_color = color.tertiary;
  }
  return (
    <TouchableOpacity style={[props.style, styles.formula_btn_view, {backgroundColor: btn_color}]} onPress={props.onPress}>
      <Text style={styles.formula_btn_text}>{props.text}</Text>
    </TouchableOpacity>
  );
}

// Large black buttons in the lower part
// Props: style, onPress, text
export const ArbitBtn = (props) => {
  return (
    <TouchableOpacity style={[props.style, styles.arbit_btn_view]} onPress={props.onPress}>
      <Text style={styles.arbit_btn_text}>{props.text}</Text>
    </TouchableOpacity>
  );
}

// Create Shape components
// Props: style
export const TriangleUp = (props) => {
  return <View style={[styles.triangle, props.style]}/>;
};
export const TriangleDown = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "180deg"}]}, props.style]}/>;
}
export const TriangleLeft = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "-90deg"}]}, props.style]}/>;
}
export const TriangleRight = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "90deg"}]}, props.style]}/>;
}
// Props: style, children
export const Circle = (props) => {
  return <View style={[styles.circle, props.style]}>{props.children}</View>
}

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
  );
}

// Create the static Help Screen (Modal)
// Props: style, visible
export const HelpModal = (props) => {
  let window_height = Dimensions.get("window").height;
  return <Modal visible={props.visible} transparent={true} animationType="slide">
    <View style={[styles.help_container, {height: window_height * 0.9}]}>
      <Text style={styles.help_title}>Help</Text>
      <ScrollView>
        <Text style={styles.help_small_title}>Control Switches</Text>
        {ctrl_helps.map((item, index) => {
          return (<HelpRow key={index} title={item.title} content={item.content}/>);
        })}
        <Text style={styles.help_small_title}>Programs</Text>
        {program_helps.map((item, index) => {
          return (<HelpRow key={index} title={item.title} content={item.content}/>);
        })}
        <Text style={styles.help_small_title}>Functions</Text>
        {func_helps.map((item, index) => {
          return (<HelpRow key={index} title={item.title} content={item.content}/>);
        })}
      </ScrollView>
      <View style={{justifyContent: "center", alignContent: "center", alignSelf: "center"}}>
        <TouchableOpacity style={styles.help_close_btn} onPress={props.onCloseClicked}>
          <Text style={styles.help_close_text}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
}