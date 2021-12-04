import React, { createContext, useReducer, ReactNode } from "react";
import { find } from "lodash";

// @ts-ignore
import { osqueryTables } from "utilities/osquery_tables";
import { DEFAULT_POLICY } from "utilities/constants";
import { IOsqueryTable } from "interfaces/osquery_table";
import { IQueryPlatform } from "interfaces/query";
import { StringifyOptions } from "querystring";

type Props = {
  children: ReactNode;
};

type InitialStateType = {
  lastEditedQueryName: string;
  lastEditedQueryDescription: string;
  lastEditedQueryBody: string;
  lastEditedQueryPlatform: IQueryPlatform | null | undefined;
  lastEditedQueryResolution: string;
  setLastEditedQueryName: (value: string) => void;
  setLastEditedQueryDescription: (value: string) => void;
  setLastEditedQueryBody: (value: string) => void;
  policyTeamId: number;
  setPolicyTeamId: (id: number) => void;
  selectedOsqueryTable: IOsqueryTable;
  setLastEditedQueryPlatform: (
    value: IQueryPlatform | null | undefined
  ) => void;
  setLastEditedQueryResolution: (value: string) => void;
  setSelectedOsqueryTable: (tableName: string) => void;
};

const initialState = {
  lastEditedQueryName: "",
  lastEditedQueryDescription: DEFAULT_POLICY.description,
  lastEditedQueryBody: "",
  lastEditedQueryPlatform: DEFAULT_POLICY.platform,
  lastEditedQueryResolution: "",
  setLastEditedQueryName: () => null,
  setLastEditedQueryDescription: () => null,
  setLastEditedQueryBody: () => null,
  policyTeamId: 0,
  setPolicyTeamId: () => null,
  selectedOsqueryTable: find(osqueryTables, { name: "users" }),
  setLastEditedQueryPlatform: () => null,
  setLastEditedQueryResolution: () => null,
  setSelectedOsqueryTable: () => null,
};

const actions = {
  SET_LAST_EDITED_QUERY_INFO: "SET_LAST_EDITED_QUERY_INFO",
  SET_POLICY_TEAM_ID: "SET_POLICY_TEAM_ID",
  SET_SELECTED_OSQUERY_TABLE: "SET_SELECTED_OSQUERY_TABLE",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case actions.SET_POLICY_TEAM_ID:
      return {
        ...state,
        policyTeamId: action.id,
      };
    case actions.SET_SELECTED_OSQUERY_TABLE:
      return {
        ...state,
        selectedOsqueryTable: find(osqueryTables, { name: action.tableName }),
      };
    case actions.SET_LAST_EDITED_QUERY_INFO:
      return {
        ...state,
        lastEditedQueryName:
          typeof action.lastEditedQueryName === "undefined"
            ? state.lastEditedQueryName
            : action.lastEditedQueryName,
        lastEditedQueryDescription:
          typeof action.lastEditedQueryDescription === "undefined"
            ? state.lastEditedQueryDescription
            : action.lastEditedQueryDescription,
        lastEditedQueryBody:
          typeof action.lastEditedQueryBody === "undefined"
            ? state.lastEditedQueryBody
            : action.lastEditedQueryBody,
        lastEditedQueryPlatform:
          typeof action.lastEditedQueryPlatform === "undefined"
            ? state.lastEditedQueryPlatform
            : action.lastEditedQueryPlatform,
        lastEditedQueryResolution:
          typeof action.lastEditedQueryResolution === "undefined"
            ? state.lastEditedQueryResolution
            : action.lastEditedQueryResolution,
      };
    default:
      return state;
  }
};

export const PolicyContext = createContext<InitialStateType>(initialState);

const PolicyProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = {
    lastEditedQueryName: state.lastEditedQueryName,
    lastEditedQueryDescription: state.lastEditedQueryDescription,
    lastEditedQueryBody: state.lastEditedQueryBody,
    lastEditedQueryPlatform: state.lastEditedQueryPlatform,
    lastEditedQueryResolution: state.lastEditedQueryResolution,
    setLastEditedQueryName: (lastEditedQueryName: string) => {
      dispatch({
        type: actions.SET_LAST_EDITED_QUERY_INFO,
        lastEditedQueryName,
      });
    },
    setLastEditedQueryDescription: (lastEditedQueryDescription: string) => {
      dispatch({
        type: actions.SET_LAST_EDITED_QUERY_INFO,
        lastEditedQueryDescription,
      });
    },
    setLastEditedQueryBody: (lastEditedQueryBody: string) => {
      dispatch({
        type: actions.SET_LAST_EDITED_QUERY_INFO,
        lastEditedQueryBody,
      });
    },
    setLastEditedQueryPlatform: (
      lastEditedQueryPlatform: IQueryPlatform | null | undefined
    ) => {
      dispatch({
        type: actions.SET_LAST_EDITED_QUERY_INFO,
        lastEditedQueryPlatform,
      });
    },
    policyTeamId: state.policyTeamId,
    setPolicyTeamId: (id: number) => {
      dispatch({ type: actions.SET_POLICY_TEAM_ID, id });
    },
    selectedOsqueryTable: state.selectedOsqueryTable,
    setLastEditedQueryResolution: (lastEditedQueryResolution: string) => {
      dispatch({
        type: actions.SET_LAST_EDITED_QUERY_INFO,
        lastEditedQueryResolution,
      });
    },
    setSelectedOsqueryTable: (tableName: string) => {
      dispatch({ type: actions.SET_SELECTED_OSQUERY_TABLE, tableName });
    },
  };

  return (
    <PolicyContext.Provider value={value}>{children}</PolicyContext.Provider>
  );
};

export default PolicyProvider;
