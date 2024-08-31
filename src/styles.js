/* Styles for all other files */

import { StyleSheet } from "react-native"

export const color = {
  primary: "#3498DB",
  secondary: "#21618C",
  tertiary: "orange",
  background: "#AED6F1",
  text: "white"

  // primary: "grey",
  // secondary: "black",
  // tertiary: "orange",
  // background: "white",
  // text: "white" 
}

export const styles = StyleSheet.create({
  // Environment
  background: {
    width: "100%",
    height: "100%",
    backgroundColor: color.primary,
  },
  environment: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: color.primary,
  },
  sidebar: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  main: {
    flex: 9,
    flexDirection: "column",
    justifyContent: "center",
  },

  // Upper container
  upper_container: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 100,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  display_screen: {
    width: "90%",
    height: 100,
    padding: 10,
    borderWidth: 2,
    backgroundColor: color.background,
  },
  input_row: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: color.background,
  },
  output_row: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: color.background,
  },
  output_ans: {
    fontSize: 30,
    fontWeight: "bold",
  },

  // Middle container
  mid_container: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
  },
  mid_subcontainer: {
    flex: 1,
    borderWidth: 1,
  },
  mid_row: {
    flex: 1,
    flexDirection: "row",
  },
  mid_large_row: {
    flex: 2,
    flexDirection: "row",
  },
  mid_row_side: {
    flex: 1,
  },
  mid_row_center: {
    flex: 2,
    justifyContent: "center",
    alignContent: "center",
  },
  mid_column: {
    flex: 1,
    justifyContent: "center",
  },
  mid_large_column: {
    flex: 2,
    justifyContent: "center",
    alignContent: "center",
  },
  info_text: {
    color: color.text,
    fontSize: 20,
  },

  // Lower container
  lower_container: {
    flex: 4,
    flexDirection: "column",
    padding: 5,
    backgroundColor: color.background,
  },
  btn_container: {
    // flex: 1,
    flexDirection: "column",
  },
  btn_row: {
    flexDirection: "row",
  },
  var_record_box: {
    alignSelf: "flex-start",
  },
  var_record: {
    color: color.secondary,
    fontSize: 20,
  },

  // Components
  block: {
    justifyContent: "center",
    alignItems: "center",
  },
  block_text: {
    fontSize: 30,
    fontWeight: "bold",
  },
  ctrl_view: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctrl_text: {
    flex: 3,
    color: color.text,
    fontSize: 16,
    textAlign: "center",
  },
  ctrl_switch: {
    flex: 2,
    marginVertical: -8,
  },
  program_btn_view: {
    flex: 1,
    margin: 2,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.tertiary,
  },
  program_btn_text: {
    color: color.text,
    fontSize: 16,
  },
  formula_btn_view: {
    flex: 1,
    height: 40,
    margin: 2,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  formula_btn_text: {
    color: color.text,
    fontSize: 16,
  },
  arbit_btn_view: {
    flex: 1,
    height: 50,
    margin: 2,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: color.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  arbit_btn_text: {
    color: color.text,
    fontSize: 30,
  },

  // Shapes
  triangle: {
    borderStyle: "solid",
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: color.secondary,
    backgroundColor: "transparent",
    alignSelf: "center",
  },
  circle: {
    width: "80%",
    height: "80%",
    borderRadius: 200,
    backgroundColor: color.secondary,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  // General modal
  modal_container: {
    margin: 20,
    padding: 35,
    borderRadius: 20,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "white",
  },
  modal_title: {
    fontSize: 30,
    fontWeight: "bold",
    paddingVertical: 5,
  },
  modal_small_title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modal_close_box: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  modal_close_btn: {
    width: 100,
    height: 40,
    margin: 5,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  modal_close_text: {
    fontSize: 20,
    color: color.text,
    justifyContent: "center",
    alignItems: "center",
  },
  moda_set_btn: {
    flex: 1,
    margin: 5,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  modal_use_btn: {
    flex: 1,
    margin: 5,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  modal_remove_btn: {
    flex: 1,
    margin: 5,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  modal_btn_text: {
    fontSize: 12,
    color: color.text,
    justifyContent: "center",
    alignItems: "center",
  },
  // Help modal
  help_row_container: {
    flexDirection: "row",
    borderWidth: 2,
  },
  help_row_left: {
    flex: 1,
  },
  help_row_right: {
    flex: 3,
    borderLeftWidth: 2,
  },
  help_row_title: {
    fontSize: 16,
    fontWeight: "bold",
    paddingLeft: 5,
  },
  help_row_content: {
    fontSize: 16,
    paddingHorizontal: 5,
  },
  // History modal
  hist_row_container: {
    flexDirection: "row",
    borderBottomWidth: 2,
  },
  hist_display_box: {
    flex: 8,
    borderWidth: 1,
    margin: 3,
  },
  hist_use_btn: {
    flex: 1,
    margin: 5,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  hist_remove_btn: {
    flex: 1,
    margin: 5,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  hist_btn_text: {
    fontSize: 12,
    color: color.text,
    justifyContent: "center",
    alignItems: "center",
  },
  // Constants Modal
  const_add_box: {
    flexDirection: "row",
    borderWidth: 2,
  },
  const_add_input: {
    flex: 3,
    paddingLeft: 5,
  },
  const_add_btn: {
    flex: 1,
    margin: 5,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  const_add_btn_text: {
    fontSize: 16,
    padding: 5,
    color: color.text,
    justifyContent: "center",
    alignItems: "center",
  },
  const_row_container: {
    flexDirection: "column",
    borderBottomWidth: 2,
  },
  const_display_box: {
    paddingTop: 2,
    margin: 5,
    borderWidth: 2,
  },
  const_display_top: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  const_display_botton: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  const_name_text: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 5,
  },
  const_value_text: {
    flex: 4,
    fontSize: 16,
    paddingHorizontal: 5,
  },
})