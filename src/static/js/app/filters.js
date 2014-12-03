control.filter('tometric', function() {
  return function(text) {
     return text.replace(/\./g, "_")
  } 
})

control.filter('reverse', function(Commands) {
  return function (text) {
    return text.split("").reverse().join("")+" ";
  }
})

control.filter('evalCommand', function(Commands, Agents) {
  return function (line) {
    try {
        return eval(line); 
    } catch (e) {
        if (e instanceof SyntaxError) {
            return e.message;
        }
    }
    return ""
  }
})
