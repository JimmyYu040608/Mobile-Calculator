/* The Constant pop-up window exported as ConstModal */

import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Dimensions } from "react-native";
import { useState } from "react";
import { CloseBtn, ModalRemoveBtn, ModalSetBtn, ModalUseBtn } from "./components";
import { styles } from "./styles";

// Create each row for each constant in ConstModal
// Props: name, value, onSetClicked, onUseClicked, onRemoveClicked
const ConstRow = (props) => {
  return (
    <View style={styles.const_row_container}>
      <View style={styles.const_display_box}>
        <View style={styles.const_display_top}>
          <Text style={styles.const_name_text}>{props.name}</Text>
          <Text style={styles.const_value_text}>Value: {props.value}</Text>
        </View>
        <View style={styles.const_display_botton}>
          <ModalSetBtn onPress={props.onSetClicked}/>
          <ModalUseBtn onPress={props.onUseClicked}/>
          <ModalRemoveBtn onPress={props.onRemoveClicked}/>
        </View>
      </View>
    </View>
  );
}

// Create the Constant Modal
// Props: visible, data, answer, onCloseClicked, onCreate, onSet, onUse, onRemove
export default ConstModal = (props) => {
  const [text, setText] = useState("");
  const window_height = Dimensions.get("window").height;
  
  return (
    <Modal visible={props.visible} transparent={true} animationType="slide">
      <View style={[styles.modal_container, {height: window_height * 0.9}]}>
        <Text style={styles.modal_title}>Constants</Text>
        <ScrollView>
          <Text style={styles.modal_small_title}>Set new constant</Text>
          <Text>*Names of constants can only consist of English alphabetic characters: A-Z, a-z.</Text>
          <View style={styles.const_add_box}>
            <TextInput style={styles.const_add_input} placeholder="Name of const..." value={text} onChangeText={setText}></TextInput>
            <TouchableOpacity style={styles.const_add_btn} onPress={() => props.onCreate(text)}>
              <Text style={styles.const_add_btn_text}>Create</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modal_small_title}>Instructions:</Text>
          <Text>Set: Set the constant with the value of current answer.</Text>
          <Text>Use: Apply the constant to the formula.</Text>
          <Text>X: Remove the constant.</Text>
          <Text style={{fontWeight: "bold"}}>Current Ans = {props.answer}</Text>
          {props.data.map((item, index) => {
            return <ConstRow key={index} name={item.name} value={item.value} onSetClicked={() => {props.onSet(index)}} onUseClicked={() => props.onUse(index)} onRemoveClicked={() => props.onRemove(index)}/>
          })}
        </ScrollView>
        <View style={styles.modal_close_box}>
          <CloseBtn onPress={() => {props.onCloseClicked(); setText("")}}/>
        </View>
      </View>
    </Modal>
  )
}