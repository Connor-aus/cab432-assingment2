// not a visible component
// should this go here
export default function RandomNumGen(seed) {
  var x = Math.sin(seed++) * 100000000;
  return Math.abs(Math.round(x));
}
