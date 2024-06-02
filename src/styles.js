import { StyleSheet } from "react-native"
export const styles = StyleSheet.create({
	// Environment
	environment: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		backgroundColor: "grey",
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
		backgroundColor: "grey",
	},
	display_screen: {
		width: "90%",
		height: 100,
		padding: 10,
		borderWidth: 2,
		backgroundColor: "white",
		// alignItems: "center",
		// justifyContent: "center",
	},
	input_row: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "flex-start",
		justifyContent: "center",
	},
	output_row: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "flex-end",
		justifyContent: "center",
	},
	output_ans: {
		fontSize: 30,
		fontWeight: 'bold',
	},
  control_bar: {

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
    // borderTopWidth: 2,
    // borderBottomWidth: 2,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
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
    // borderWidth: 1,
    // borderColor: "blue",
  },
  mid_column: {
    flex: 1,
    justifyContent: "center",
    // borderWidth: 1,
    // borderColor: "blue",
  },
  mid_large_column: {
    flex: 2,
  },

	// Lower container
	lower_container: {
		flex: 4,
		flexDirection: "column",
		padding: 5,
		// justifyContent: "flex-end",
		backgroundColor: "white",
	},
	btn_container: {
		// flex: 1,
		flexDirection: "column",
	},
	btn_row: {
		flexDirection: "row",
	},

  // Shapes
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "black",
    alignSelf: "center",
  },
})