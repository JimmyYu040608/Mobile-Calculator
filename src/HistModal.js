/* The History pop-up window exported as HistModal */

import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions } from "react-native"
import { CloseBtn, ModalRemoveBtn, ModalUseBtn } from "./components";
import { styles } from "./styles"

// Create each row in HistModal
// Props: formula, answer, onUseClicked, onRemoveClicked
const HistRow = (props) => {
  return (
    <View style={styles.hist_row_container}>
      <View style={styles.hist_display_box}>
        <Text>{props.formula}</Text>
        <Text>{"="+props.answer}</Text>
      </View>
      <ModalUseBtn onPress={props.onUseClicked}/>
      <ModalRemoveBtn onPress={props.onRemoveClicked}/>
    </View>
  )
}

// Create the History Modal
// Props: visible, data, onCloseClicked, onUse, onRemove
export default HistModal = (props) => {
  const window_height = Dimensions.get("window").height;
  return (
    <Modal visible={props.visible} transparent={true} animationType="slide">
      <View style={[styles.modal_container, {height: window_height * 0.9}]}>
        <Text style={styles.modal_title}>History</Text>
        {props.data.length == 0 ? <Text style={styles.modal_small_title}>History is empty</Text> : null}
        <ScrollView>
          {props.data.map((item, index) => {
            return <HistRow key={index} formula={item.formula} answer={item.answer} onUseClicked={() => props.onUse(index)} onRemoveClicked={() => props.onRemove(index)}/>
          })}
        </ScrollView>
        <View style={styles.modal_close_box}>
          <CloseBtn onPress={props.onCloseClicked}/>
        </View>
      </View>
    </Modal>
  )
}