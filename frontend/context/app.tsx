import React, { createContext, useReducer, ReactNode } from "react";

import { IConfig } from "interfaces/config";
import { IEnrollSecret } from "interfaces/enroll_secret";
import { ITeamSummary } from "interfaces/team";
import { IUser } from "interfaces/user";
import permissions from "utilities/permissions";
import sort from "utilities/sort";

enum ACTIONS {
  SET_AVAILABLE_TEAMS = "SET_AVAILABLE_TEAMS",
  SET_CURRENT_USER = "SET_CURRENT_USER",
  SET_CURRENT_TEAM = "SET_CURRENT_TEAM",
  SET_CONFIG = "SET_CONFIG",
  SET_ENROLL_SECRET = "SET_ENROLL_SECRET",
}

interface ISetAvailableTeamsAction {
  type: ACTIONS.SET_AVAILABLE_TEAMS;
  availableTeams: ITeamSummary[];
}

interface ISetConfigAction {
  type: ACTIONS.SET_CONFIG;
  config: IConfig;
}

interface ISetCurrentTeamAction {
  type: ACTIONS.SET_CURRENT_TEAM;
  currentTeam: ITeamSummary | undefined;
}
interface ISetCurrentUserAction {
  type: ACTIONS.SET_CURRENT_USER;
  currentUser: IUser;
}
interface ISetEnrollSecretAction {
  type: ACTIONS.SET_ENROLL_SECRET;
  enrollSecret: IEnrollSecret[];
}

type IAction =
  | ISetAvailableTeamsAction
  | ISetConfigAction
  | ISetCurrentTeamAction
  | ISetCurrentUserAction
  | ISetEnrollSecretAction;

type Props = {
  children: ReactNode;
};

type InitialStateType = {
  availableTeams: ITeamSummary[] | undefined;
  config: IConfig | null;
  currentUser: IUser | null;
  currentTeam: ITeamSummary | undefined;
  enrollSecret: IEnrollSecret[] | null;
  isPreviewMode: boolean | undefined;
  isSandboxMode: boolean | undefined;
  isFreeTier: boolean | undefined;
  isPremiumTier: boolean | undefined;
  isGlobalAdmin: boolean | undefined;
  isGlobalMaintainer: boolean | undefined;
  isGlobalObserver: boolean | undefined;
  isOnGlobalTeam: boolean | undefined;
  isAnyTeamMaintainer: boolean | undefined;
  isAnyTeamMaintainerOrTeamAdmin: boolean | undefined;
  isTeamObserver: boolean | undefined;
  isTeamMaintainer: boolean | undefined;
  isTeamMaintainerOrTeamAdmin: boolean | undefined;
  isAnyTeamAdmin: boolean | undefined;
  isTeamAdmin: boolean | undefined;
  isOnlyObserver: boolean | undefined;
  isNoAccess: boolean | undefined;
  setAvailableTeams: (availableTeams: ITeamSummary[]) => void;
  setCurrentUser: (user: IUser) => void;
  setCurrentTeam: (team: ITeamSummary | undefined) => void;
  setConfig: (config: IConfig) => void;
  setEnrollSecret: (enrollSecret: IEnrollSecret[]) => void;
};

export type IAppContext = InitialStateType;

const initialState = {
  availableTeams: undefined,
  config: null,
  currentUser: null,
  currentTeam: undefined,
  enrollSecret: null,
  isPreviewMode: false,
  isSandboxMode: false,
  isFreeTier: undefined,
  isPremiumTier: undefined,
  isGlobalAdmin: undefined,
  isGlobalMaintainer: undefined,
  isGlobalObserver: undefined,
  isOnGlobalTeam: undefined,
  isAnyTeamMaintainer: undefined,
  isAnyTeamMaintainerOrTeamAdmin: undefined,
  isTeamObserver: undefined,
  isTeamMaintainer: undefined,
  isTeamMaintainerOrTeamAdmin: undefined,
  isAnyTeamAdmin: undefined,
  isTeamAdmin: undefined,
  isOnlyObserver: undefined,
  isNoAccess: undefined,
  setAvailableTeams: () => null,
  setCurrentUser: () => null,
  setCurrentTeam: () => null,
  setConfig: () => null,
  setEnrollSecret: () => null,
};

const detectPreview = () => {
  return window.location.origin === "http://localhost:1337";
};

// helper function - this is run every
// time currentUser, currentTeam, config, or teamId is changed
const setPermissions = (
  user: IUser | null,
  config: IConfig | null,
  teamId = 0
) => {
  if (!user || !config) {
    return {};
  }

  return {
    isSandboxMode: permissions.isSandboxMode(config),
    isFreeTier: permissions.isFreeTier(config),
    isPremiumTier: permissions.isPremiumTier(config),
    isGlobalAdmin: permissions.isGlobalAdmin(user),
    isGlobalMaintainer: permissions.isGlobalMaintainer(user),
    isGlobalObserver: permissions.isGlobalObserver(user),
    isOnGlobalTeam: permissions.isOnGlobalTeam(user),
    isAnyTeamMaintainer: permissions.isAnyTeamMaintainer(user),
    isAnyTeamMaintainerOrTeamAdmin: permissions.isAnyTeamMaintainerOrTeamAdmin(
      user
    ),
    isAnyTeamAdmin: permissions.isAnyTeamAdmin(user),
    isTeamObserver: permissions.isTeamObserver(user, teamId),
    isTeamMaintainer: permissions.isTeamMaintainer(user, teamId),
    isTeamAdmin: permissions.isTeamAdmin(user, teamId),
    isTeamMaintainerOrTeamAdmin: permissions.isTeamMaintainerOrTeamAdmin(
      user,
      teamId
    ),
    isOnlyObserver: permissions.isOnlyObserver(user),
    isNoAccess: permissions.isNoAccess(user),
  };
};

const reducer = (state: InitialStateType, action: IAction) => {
  switch (action.type) {
    case ACTIONS.SET_AVAILABLE_TEAMS: {
      const { availableTeams } = action;

      return {
        ...state,
        availableTeams:
          availableTeams?.sort((a: ITeamSummary, b: ITeamSummary) =>
            sort.caseInsensitiveAsc(a.name, b.name)
          ) || [],
      };
    }
    case ACTIONS.SET_CURRENT_USER: {
      const { currentUser } = action;

      return {
        ...state,
        currentUser,
        ...setPermissions(currentUser, state.config, state.currentTeam?.id),
      };
    }
    case ACTIONS.SET_CURRENT_TEAM: {
      const { currentTeam } = action;
      return {
        ...state,
        currentTeam,
        ...setPermissions(state.currentUser, state.config, currentTeam?.id),
      };
    }
    case ACTIONS.SET_CONFIG: {
      const { config } = action;
      // config.sandbox_enabled = true; // TODO: uncomment for sandbox dev

      return {
        ...state,
        config,
        ...setPermissions(state.currentUser, config, state.currentTeam?.id),
      };
    }
    case ACTIONS.SET_ENROLL_SECRET: {
      const { enrollSecret } = action;
      return {
        ...state,
        enrollSecret,
      };
    }
    default:
      return state;
  }
};

export const AppContext = createContext<InitialStateType>(initialState);

const AppProvider = ({ children }: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = {
    availableTeams: state.availableTeams,
    config: state.config,
    currentUser: state.currentUser,
    currentTeam: state.currentTeam,
    enrollSecret: state.enrollSecret,
    isPreviewMode: detectPreview(),
    isSandboxMode: state.isSandboxMode,
    isFreeTier: state.isFreeTier,
    isPremiumTier: state.isPremiumTier,
    isGlobalAdmin: state.isGlobalAdmin,
    isGlobalMaintainer: state.isGlobalMaintainer,
    isGlobalObserver: state.isGlobalObserver,
    isOnGlobalTeam: state.isOnGlobalTeam,
    isAnyTeamMaintainer: state.isAnyTeamMaintainer,
    isAnyTeamMaintainerOrTeamAdmin: state.isAnyTeamMaintainerOrTeamAdmin,
    isTeamObserver: state.isTeamObserver,
    isTeamMaintainer: state.isTeamMaintainer,
    isTeamAdmin: state.isTeamAdmin,
    isTeamMaintainerOrTeamAdmin: state.isTeamMaintainer,
    isAnyTeamAdmin: state.isAnyTeamAdmin,
    isOnlyObserver: state.isOnlyObserver,
    isNoAccess: state.isNoAccess,
    setAvailableTeams: (availableTeams: ITeamSummary[]) => {
      dispatch({ type: ACTIONS.SET_AVAILABLE_TEAMS, availableTeams });
    },
    setCurrentUser: (currentUser: IUser) => {
      dispatch({ type: ACTIONS.SET_CURRENT_USER, currentUser });
    },
    setCurrentTeam: (currentTeam: ITeamSummary | undefined) => {
      dispatch({ type: ACTIONS.SET_CURRENT_TEAM, currentTeam });
    },
    setConfig: (config: IConfig) => {
      dispatch({ type: ACTIONS.SET_CONFIG, config });
    },
    setEnrollSecret: (enrollSecret: IEnrollSecret[]) => {
      dispatch({ type: ACTIONS.SET_ENROLL_SECRET, enrollSecret });
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
