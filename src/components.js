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
  )
}

// Switches to toggle calculation settings
// Props: style, onValueChange, value, text
export const CtrlSwitch = (props) => {
  return (
    <View style={[props.style, styles.ctrl_view]}>
      <Text style={styles.ctrl_text}>{props.text}</Text>
      <Switch style={styles.ctrl_switch} onValueChange={props.onValueChange} value={props.value}></Switch>
    </View>
  )
}

// Long orange buttons in middle part
// Props: style, onPress, text
export const ProgramBtn = (props) => {
  return (
    <TouchableOpacity style={[props.style, styles.program_btn_view]} onPress={props.onPress}>
      <Text style={styles.program_btn_text}>{props.text}</Text>
    </TouchableOpacity>
  )
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
  )
}

// Large black buttons in the lower part
// Props: style, onPress, text
export const ArbitBtn = (props) => {
  return (
    <TouchableOpacity style={[props.style, styles.arbit_btn_view]} onPress={props.onPress}>
      <Text style={styles.arbit_btn_text}>{props.text}</Text>
    </TouchableOpacity>
  )
}

// Close button in Modal
// Props: onPress
export const CloseBtn = (props) => {
  return (
    <TouchableOpacity style={styles.modal_close_btn} onPress={props.onPress}>
      <Text style={styles.modal_close_text}>Close</Text>
    </TouchableOpacity>
  )
}

// Set button in Modal
// Props: onPress
export const ModalSetBtn = (props) => {
  return (
    <TouchableOpacity style={styles.moda_set_btn} onPress={props.onPress}>
      <Text style={styles.modal_btn_text}>Set</Text>
    </TouchableOpacity>
  )
}

// Use button in Modal
// Props: onPress
export const ModalUseBtn = (props) => {
  return (
    <TouchableOpacity style={styles.modal_use_btn} onPress={props.onPress}>
      <Text style={styles.hist_btn_text}>Use</Text>
    </TouchableOpacity>
  )
}

// Remove button in Modal
// Props: onPress
export const ModalRemoveBtn = (props) => {
  return (
    <TouchableOpacity style={styles.modal_remove_btn} onPress={props.onPress}>
      <Text style={styles.modal_btn_text}>X</Text>
    </TouchableOpacity>
  )
}

// Create Shape components
// Props: style
export const TriangleUp = (props) => {
  return <View style={[styles.triangle, props.style]}/>
}
export const TriangleDown = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "180deg"}]}, props.style]}/>
}
export const TriangleLeft = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "-90deg"}]}, props.style]}/>
}
export const TriangleRight = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "90deg"}]}, props.style]}/>
}
// Props: style, children
export const Circle = (props) => {
  return <View style={[styles.circle, props.style]}>{props.children}</View>
}