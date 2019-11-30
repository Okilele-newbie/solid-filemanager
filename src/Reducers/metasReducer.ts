import { Meta } from "../Api/TagUtils";
import { Action, SET_METAS } from "../Actions/actionTypes";

interface MetasState {
    inCurFolder: Meta[];
    filter: string;
    selected: Meta[];
}

const initialMetasState: MetasState = {
    inCurFolder: [],
    filter: '',
    selected: [],
};

export const metas = (state = initialMetasState, action: Action<any>): MetasState => {
    switch (action.type) {
        case SET_METAS:
            return { ...state, inCurFolder: action.value as Meta[] };
        default:
            return state;
    }
};
