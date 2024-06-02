import { View, Text, TouchableOpacity, Switch } from "react-native";
import { styles } from "./styles";

// Create blocks for a formula
// Props: style, text
export const Block = (props) => {
  return (
    <View style={[props.style, {justifyContent: "center", alignItems: "center"}]}>
      <Text style={{fontSize: 30, fontWeight: "bold"}}>{props.text}</Text>
    </View>
  );
}

// Create button elements
// Props: style, onValueChange, value, text
export const CtrlSwitch = (props) => {
  return (
    <View style={[props.style, {flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center"}]}>
      <Text style={{flex: 3, color: "white", fontSize: 16, textAlign: "center"}}>{props.text}</Text>
      <Switch style={{flex: 2, marginVertical: -8}} onValueChange={props.onValueChange} value={props.value}></Switch>
    </View>
  );
}

// Small buttons in the middle part for different functions
// Props: style, onPress, color, text
export const FormulaBtn = (props) => {
  return (
    <TouchableOpacity style={[props.style, {flex: 1, height: 40, margin: 2, borderWidth: 2, borderRadius: 6, justifyContent: "center", alignItems: "center", backgroundColor: props.color}]} onPress={props.onPress}>
      <Text style={{color: "white", fontSize: 16}}>{props.text}</Text>
    </TouchableOpacity>
  );
}

// Black, large buttons in the lower part
// Props: style, onPress, text
export const ArbitBtn = (props) => {
  return (
    <TouchableOpacity style={[props.style, {backgroundColor: "black", flex: 1, height: 50, margin: 2, borderWidth: 2, borderRadius: 6, justifyContent: "center", alignItems: "center"}]} onPress={props.onPress}>
      <Text style={{color: "white", fontSize: 30}}>{props.text}</Text>
    </TouchableOpacity>
  );
}

// Create Triangle elements
// Props: onPress
export const TriangleUp = (props) => {
  return <View style={[styles.triangle, props.style]} onPress={props.onPress}/>;
};
export const TriangleDown = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "180deg"}]}, props.style]} onPress={props.onPress}/>;
}
export const TriangleLeft = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "-90deg"}]}, props.style]} onPress={props.onPress}/>;
}
export const TriangleRight = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "90deg"}]}, props.style]} onPress={props.onPress}/>;
}