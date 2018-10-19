"use strict";

$(document).ready(function () {
  $.ajax({
    url: '/api/system/info/static',
    type: 'GET'
  }).done(function (response) {
    if (response.success) {
      console.log(response);
      var info = response.info;
      var timeDiv = $('#time').html('');
      timeDiv.append('Current Time: ' + new Date(info.time.current) + '<br>');
      timeDiv.append('Up time: ' + Math.round(info.time.uptime / 3600) + ' hours<br>');
      var computerDiv = $('#computer-info').html('');
      computerDiv.append('Manufacturer: ' + info.system.manufacturer + '<br>');
      computerDiv.append('Model: ' + info.system.model + '<br>');
      var osDiv = $('#os-info').html('');
      osDiv.append('Platform: ' + info.osInfo.platform + '<br>');
      osDiv.append('Distro: ' + info.osInfo.distro + '<br>');
      osDiv.append('Release: ' + info.osInfo.release + '<br>');
      osDiv.append('Codename: ' + info.osInfo.codename + '<br>');
      osDiv.append('Kernel: ' + info.osInfo.kernel + '<br>');
      osDiv.append('Arch: ' + info.osInfo.arch + '<br>');
      osDiv.append('Hostname: ' + info.osInfo.hostname + '<br>');
      var cpuDiv = $('#cpu-info').html('');
      cpuDiv.append('CPU: ' + info.cpu.manufacturer + info.cpu.brand + '<br>');
      cpuDiv.append('CPU Frequency: ' + info.cpu.speed + '<br>');
      cpuDiv.append('CPU Frequency Min/Max: ' + info.cpu.speedmin + '/' + info.cpu.speedmax + '<br>');
      cpuDiv.append('CPU Cores: ' + info.cpu.cores + '<br>');
      var gpuDiv = $('#gpu-info').html('');

      for (var i = 0; i < info.graphics.controllers.length; i++) {
        for (var key in info.graphics.controllers[i]) {
          if (info.graphics.controllers[i].hasOwnProperty(key)) {
            gpuDiv.append(key + ': ' + info.graphics.controllers[i][key] + '<br>');
          }
        }
      }
    }
  }).fail(function (xhr, status, error) {
    console.log(xhr.responseJSON.message);
  });
  $.ajax({
    url: '/api/system/info/dynamic',
    type: 'GET'
  }).done(function (response) {
    if (response.success) {
      console.log(response);
      var info = response.info;
      var memDiv = $('#mem').html('');

      for (var key in info.mem) {
        if (info.mem.hasOwnProperty(key)) {
          memDiv.append(key + ': ' + Math.round(info.mem[key] / 1024 / 1024) + ' MB<br>');
        }
      }

      var fsDiv = $('#fsSize').html('');

      for (var i = 0; i < info.fsSize.length; i++) {
        fsDiv.append(info.fsSize[i].mount + ': ' + Math.round(info.fsSize[i].use) + '%' + '(' + Math.round(info.fsSize[i].used / 1024 / 1024) + ' MB used, ' + info.fsSize[i].type + ')<br>');
      }

      var loadDiv = $('#currentLoad').html('');
      loadDiv.append('Average Load: ' + Math.round(info.currentLoad.avgload) + '%<br>');
      loadDiv.append('Current Load: ' + Math.round(info.currentLoad.currentload) + '%<br>');
      loadDiv.append('Current Load(User): ' + Math.round(info.currentLoad.currentload_user) + '%<br>');
      loadDiv.append('Current Load(System): ' + Math.round(info.currentLoad.currentload_system) + '%<br>');
      loadDiv.append('Current Load(IRQ): ' + Math.round(info.currentLoad.currentload_irq) + '%<br>');
    }
  }).fail(function (xhr, status, error) {
    console.log(xhr.responseJSON.message);
  });
});
//# sourceMappingURL=systemInfo.js.map
