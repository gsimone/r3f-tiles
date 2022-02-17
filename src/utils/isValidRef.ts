export default function isValidRef(ref) {
  return ref && typeof ref.current !== "undefined" && ref.current;
}
