// react-select style objects in the brand colours.

/** Light-only styles used on the search page. */
export const brandSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#F4F4F4" : "#FFFFFF",
    borderColor: state.isFocused ? "#064E3B" : "#FFD700",
    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(6, 90, 56, 0.25)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#064E3B" : "#FFD700" },
  }),
  singleValue: (provided) => ({ ...provided, color: "#495057" }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#064E3B" : "#FFFFFF",
    color: state.isFocused ? "#FFD700" : "#495057",
    "&:hover": { backgroundColor: state.isFocused ? "#064E3B" : "#F4F4F4" },
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "#064E3B" : "#ADB5BD",
    "&:hover": { color: state.isFocused ? "#064E3B" : "#495057" },
  }),
};

const isDark = () => document.documentElement.classList.contains("dark");
const pick = (dark, light) => (isDark() ? dark : light);

/** Styles that follow the light/dark theme (read at render time). */
export const themedSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? pick("#232b2f", "#F4F4F4") : pick("#182024", "#FFFFFF"),
    borderColor: state.isFocused ? pick("#FFD700", "#064E3B") : "#FFD700",
    boxShadow: state.isFocused ? pick("0 0 0 0.2rem #FFD70055", "0 0 0 0.2rem rgba(6, 90, 56, 0.25)") : "none",
    color: pick("#fff", "#232b2f"),
    "&:hover": { borderColor: state.isFocused ? pick("#FFD700", "#064E3B") : "#FFD700" },
  }),
  singleValue: (provided) => ({ ...provided, color: pick("#fff", "#232b2f") }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? pick("#FFD700", "#064E3B") : pick("#232b2f", "#FFFFFF"),
    color: state.isFocused ? pick("#232b2f", "#FFD700") : pick("#fff", "#232b2f"),
    "&:hover": {
      backgroundColor: state.isFocused ? pick("#FFD700", "#064E3B") : pick("#232b2f", "#F4F4F4"),
      color: state.isFocused ? pick("#232b2f", "#FFD700") : pick("#fff", "#232b2f"),
    },
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? pick("#FFD700", "#064E3B") : pick("#fff", "#ADB5BD"),
    "&:hover": { color: state.isFocused ? pick("#FFD700", "#064E3B") : pick("#fff", "#495057") },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: pick("#232b2f", "#fff"),
    color: pick("#fff", "#232b2f"),
  }),
};

/**
 * The option for `value`, adding one if it isn't in the list yet (e.g. a
 * deep link arriving before the options have loaded).
 */
export const selectedOption = (options, value) =>
  value ? options.find((o) => o.value === value) || { value, label: value } : null;
