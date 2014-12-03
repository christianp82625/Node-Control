control.factory('Commands', function () {
   var Commands = {};
   Commands.list = [
     { category: "Agent Commands", command : "rw_agent_show_active", description: " List active agent IP's (registered last 6m)" },
     { category: "Agent Commands", command : "rw_agent_count", description:  "Count of active agent IP's (registered last 6m)" },
     { category: "Agent Commands", command : "rw_agent_ssh  ip", description: "SSH into ubuntu@ the agent by IP" },
     { category: "Agent Commands", command : "rw_agent_reboot ip", description: "Reboot an agent" },
     { category: "Agent Commands", command : "rw_agent_show_ec2", description: "Show all RW_FF on RedWolf & Status" },

     { category: "Broadcast Commands", command : "rw_broadcast command", description: "Send command to registered agents only" },
     { category: "Broadcast Commands", command : "rw_broadcast_all command", description: "Send command to ALL RW_FF agents (slow!)" },
     { category: "Broadcast Commands", command : "rw_broadcast_unregistered command", description: "Send command to unregistered agents only (slow!)" },

     { category: "Attack Commands", command : "rw_attack_init", description: "Stops all attacks" },

     { category: "Command Management", command : "rw_attack_command_show", description: "Displays the current bullet" },
     { category: "Command Management", command : "rw_attack_command_select command", description: "Copies /commands/$filename to bullet" },

     { category: "Per-Agent Commands", command : "rw_attack_agent_show", description: "Shows the currently attacking agents" },
     { category: "Per-Agent Commands", command : "rw_attack_agent_show_enabled", description: "List the IP's of enabled agents" },
     { category: "Per-Agent Commands", command : "rw_attack_agent_show_ready", description: "List the IP's of ready (not enabled) agents" },

     { category: "Per-Agent Commands", command : "rw_attack_agent_enable [ip ip2 ip3]", description: "Copies the bullet to the agent, if it exists" },
     { category: "Per-Agent Commands", command : "rw_attack_agent_disable [ip] [ip] [ip]", description: "Removes a command from specified agent" },

     { category: "Per-Agent Commands", command : "rw_attack_agent_update", description: "Update all running attacks to latest bullet ***untested" },
     { category: "Per-Agent Commands", command : "rw_attack_agent_broadcast", description: "Copies the bullet to all directories" },

     { category: "Group Commands", command : "rw_attack_groups_show", description: "# Show agents & current status  (GOOD!)" },
     { category: "Group Commands", command : "rw_attack_group_enable [group#]", description: "Enables a specific group" },
     { category: "Group Commands", command : "rw_attack_group_disable [group#]", description: "Disables a group (removes commands)" } ]
   return Commands;
})

/* 
control.factory('Agents', ['$http', function ($http) {
  return $http({
    url: "/query/agents/active",
    dataType: "json",
    method: "GET"
  }).success(function(data, status, headers, config) {
    Agents=data
    return  Agents
  }).error(function(data, status, headers, config) {
    Agents = []
    return Agents
  });
}])
*/
