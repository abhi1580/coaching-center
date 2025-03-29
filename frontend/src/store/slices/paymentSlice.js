import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService } from "../../services/api";

export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async () => {
    const response = await paymentService.getAll();
    return response.data;
  }
);

export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (paymentData) => {
    const response = await paymentService.create(paymentData);
    return response.data;
  }
);

export const updatePayment = createAsyncThunk(
  "payments/updatePayment",
  async ({ id, data }) => {
    const response = await paymentService.update(id, data);
    return response.data;
  }
);

export const deletePayment = createAsyncThunk(
  "payments/deletePayment",
  async (id) => {
    await paymentService.delete(id);
    return id;
  }
);

const initialState = {
  payments: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Payment
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.push(action.payload);
      })
      // Update Payment
      .addCase(updatePayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(
          (payment) => payment._id === action.payload._id
        );
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      // Delete Payment
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(
          (payment) => payment._id !== action.payload
        );
      });
  },
});

export default paymentSlice.reducer;
