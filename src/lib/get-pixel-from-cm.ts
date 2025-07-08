export const getPixelFromCM = (cm: number | string) => {
  const cmNumber = typeof cm === 'string' ? parseFloat(cm) : cm;

  const DPI = 300;
  const CM_PER_INCH = 2.54;

  const result = (cmNumber * DPI) / CM_PER_INCH;

  return Math.floor(result);
};
