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
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 100,
		// width: "100%",
		backgroundColor: color.primary,
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
    backgroundColor: color.secondary,
    flex: 1,
    height: 50,
    margin: 2,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  arbit_btn_text: {
    color: color.text,
    fontSize: 30,
  },

	// Shapes
	triangle: {
		backgroundColor: "transparent",
		borderStyle: "solid",
		borderLeftWidth: 30,
		borderRightWidth: 30,
		borderBottomWidth: 30,
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		borderBottomColor: color.secondary,
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
})