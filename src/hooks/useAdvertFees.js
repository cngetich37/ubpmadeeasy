import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import { calculateAdvertFees, SIDE_ADVERT_TYPES } from "../lib/fees";

const SEARCH_DEBOUNCE_MS = 500;

export const EMPTY_RATES = Object.freeze({
  advertisementCategory: "",
  applicationFee: "",
  firstSquareMetres: "",
  firstThreeMetres: "",
  firstTenSquareMetres: "",
  extraSquareMetres: "",
  perEachperYear: "",
});

// Starting size when an advert type is picked (minimum chargeable size).
const DEFAULT_SIZE = {
  Billboard: [3, 1],
  Wallpainting: [10, 1],
  "Window Branding": [10, 1],
  "Wall Branding": [10, 1],
};

/**
 * Advert licence quote: dropdown options, the selected type's rates, the size
 * the user enters, and the resulting fees.
 *
 * `renewalFee` / `newApplicantFee` are "" until the selected type's rates have loaded.
 *
 * @param {object} callbacks { onError(error), onSuccess() }
 */
export function useAdvertFees({ onError, onSuccess } = {}) {
  const callbacks = useRef({ onError, onSuccess });
  callbacks.current = { onError, onSuccess };

  const [options, setOptions] = useState([]);
  const [advertType, setAdvertType] = useState("");
  const [rates, setRates] = useState({ ...EMPTY_RATES, type: "" });
  const [length, setLength] = useState(1);
  const [width, setWidth] = useState(1);
  const [numberOfSides, setNumberOfSides] = useState(1);
  const [loading, setLoading] = useState(false);

  const isSideType = SIDE_ADVERT_TYPES.includes(advertType);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .adverts()
      .then((items) => {
        if (cancelled) return;
        setOptions(
          items
            .map((item) => ({ value: item.advertType, label: item.advertType }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
      })
      .catch((error) => !cancelled && callbacks.current.onError?.(error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset the size for the newly selected type.
  useEffect(() => {
    const [l, w] = DEFAULT_SIZE[advertType] || [1, 1];
    setLength(l);
    setWidth(w);
    if (!SIDE_ADVERT_TYPES.includes(advertType)) setNumberOfSides(1);
  }, [advertType]);

  // Selected type -> rates (debounced).
  useEffect(() => {
    if (advertType === "") {
      setRates({ ...EMPTY_RATES, type: "" });
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.advert(advertType);
        if (cancelled) return;
        setRates({
          type: advertType,
          advertisementCategory: data.advertisementCategory ?? "",
          applicationFee: data.applicationFee ?? "",
          firstSquareMetres: data.firstSquareMetres ?? "",
          firstThreeMetres: data.firstThreeMetres ?? "",
          firstTenSquareMetres: data.firstTenSquareMetres ?? "",
          extraSquareMetres: data.extraSquareMetres ?? "",
          perEachperYear: data.perEachperYear ?? "",
        });
        callbacks.current.onSuccess?.();
      } catch (error) {
        if (cancelled) return;
        setRates({ ...EMPTY_RATES, type: "" });
        callbacks.current.onError?.(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [advertType]);

  const ratesLoaded = advertType !== "" && rates.type === advertType;
  const { renewalFee, newApplicantFee } = useMemo(
    () =>
      ratesLoaded
        ? calculateAdvertFees(advertType, rates, { length, width, numberOfSides })
        : { renewalFee: "", newApplicantFee: "" },
    [ratesLoaded, advertType, rates, length, width, numberOfSides]
  );

  return {
    options,
    advertType,
    setAdvertType,
    rates: ratesLoaded ? rates : { ...EMPTY_RATES, type: "" },
    ratesLoaded,
    length,
    setLength,
    width,
    setWidth,
    numberOfSides,
    setNumberOfSides,
    isSideType,
    renewalFee,
    newApplicantFee,
    loading,
  };
}
