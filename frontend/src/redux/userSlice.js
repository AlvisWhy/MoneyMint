import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        userId: null,
        username: ""
    },
    portfolioData: {
        balance: 0,
        portfolios: []
    }
};

export const userSlice = createSlice({
    name: "userData",
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        setPortfolioData(state, action) {
            state.portfolioData = action.payload;
        },
        updateBalance(state, action) {
            state.portfolioData.balance = action.payload;
        },
        addPortfolio(state, action) {
            state.portfolioData.portfolios.push(action.payload);
        },
        updatePortfolio(state, action) {
            const { portfolio_id, updatedData } = action.payload;
            const index = state.portfolioData.portfolios.findIndex(
                p => p.portfolio_id === portfolio_id
            );
            if (index !== -1) {
                state.portfolioData.portfolios[index] = {
                    ...state.portfolioData.portfolios[index],
                    ...updatedData
                };
            }
        }
    }
});

export const {
    setUser,
    setPortfolioData,
    updateBalance,
    addPortfolio,
    updatePortfolio
} = userSlice.actions;

export default userSlice.reducer;
