import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./PremiumDatePicker.module.css";

interface PremiumDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
}

export default function PremiumDatePicker({ label, value, onChange, minDate, maxDate, required }: PremiumDatePickerProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="MM/dd/yyyy"
        className={`w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm bg-white text-gray-900 transition duration-150 ${styles.premiumInput}`}
        calendarClassName={styles.premiumCalendar}
        placeholderText="mm/dd/yyyy"
        minDate={minDate}
        maxDate={maxDate}
        required={required}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
    </div>
  );
}
