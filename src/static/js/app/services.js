control.service('Agents', ['$http', function ($http) {
  $http({
    url: "/query/agents/active",
    dataType: "json",
    method: "GET"
  }).success(function(data, status, headers, config) {
   console.log(data)
   Agents=data
   return  Agents
  }).error(function(data, status, headers, config) {
    Agents = [{ a:1}]
    return  Agents
  });
}])
