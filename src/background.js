(function (window, chrome) {

  window.localStorage.setItem("rasp", "benua_lenina");

  var config = {
    needed_autobuses_number: 4
  };

  var colors = {
    ok:    [0, 128, 0, 255],
    alarm: [192, 0, 0, 255],
    error: [192, 192, 192, 255]
  };

  var schedules = {
    benua_lenina: 
      [
        [7, [40, 50]],
        [8, [0, 10, 20, 30, 40, 50]],
        [9, [0, 10, 20, 30, 40, 50]],
        [10, [0, 10, 20, 30, 40, 50]],
        [11, [0, 10, 20, 30, 40, 50]],
        [12, [0, 10, 20, 40]],
        [13, [0, 20, 40]],
        [14, [0, 20, 40]],
        [15, [0, 20, 40]],
        [16, [0, 20, 40]],
        [17, [0, 10, 20, 30, 40, 50]],
        [18, [0, 10, 20, 30, 40, 50]],
        [19, [0, 10, 20, 30, 40, 50]],
        [20, [0, 10, 20, 40]],
        [21, [0, 20, 40]],
        [22, [20]],
        [23, [0]]
      ],
    lenina_benua: 
      [
        [7, [20, 30, 40, 50]],
        [8, [0, 10, 20, 30, 40, 50]],
        [9, [0, 10, 20, 30, 40, 50]],
        [10, [0, 10, 20, 30, 40, 50]],
        [11, [0, 10, 20, 30, 40, 50]],
        [12, [0, 20, 40]],
        [13, [0, 20, 40]],
        [14, [0, 20, 40]],
        [15, [0, 20, 40]],
        [16, [0, 20, 40]],
        [17, [0, 20, 30, 40, 50]],
        [18, [0, 10, 20, 30, 40, 50]],
        [19, [0, 10, 20, 30, 40, 50]],
        [20, [0, 20, 40]],
        [21, [0, 20]],
        [22, [0, 40]]
      ],
    benua_novocherkasskaya: 
      [
        [9, [30, 50]],
        [10, [10, 30, 50]],
        [11, [10, 30, 50]],
        [12, [10, 30, 50]],
        [13, [10]],
        [17, [10, 30, 50]],
        [18, [10, 30, 50]],
        [19, [10, 30, 50]],
        [20, [10, 30, 50]]
      ],
    novocherkasskaya_benua: 
      [
        [9, [10, 30, 50]],
        [10, [10, 30, 50]],
        [11, [10, 30, 50]],
        [12, [10, 30, 50]],
        [17, [10, 30, 50]],
        [18, [10, 30, 50]],
        [19, [10, 30, 50]],
        [20, [10, 30, 50]]
      ]
  };

  function Shedule() {
    return {
      data: [],
      reorganized: [],
      reorganize: function (name) {
        this.data = schedules[name];
        for (var i = 0; i < this.data.length; ++i) {
          for (var j = 0; j < this.data[i][1].length; ++j) {
            this.reorganized.push({
                h: this.data[i][0], 
                m: this.data[i][1][j]
            });
          }
        }
      },
      after: function (h, m) {
        var found = [], i, autobus;
        for (i = 0; i < this.reorganized.length && found.length < config.needed_autobuses_number; ++i) {
          autobus = this.reorganized[i];
          if (autobus.h == h && autobus.m > m || autobus.h > h) {
            found.push(autobus);
          }
        }
        if (found.length < config.needed_autobuses_number) {
          for (i = 0; found.length < config.needed_autobuses_number; ++i) {
            autobus = this.reorganized[i];
            found.push(autobus);
          }
        }
        return found;
      }
    }
  };

  var reorganized = {
    benua_lenina: new Shedule(),
    lenina_benua: new Shedule(),
    benua_novocherkasskaya: new Shedule(),
    novocherkasskaya_benua: new Shedule()
  };

  for (var k in reorganized) {
    reorganized[k].reorganize(k);
  }

  function badge (minutes) {
    chrome.browserAction.setBadgeBackgroundColor({
        color: minutes <= 5 ? colors.alarm : colors.ok
    });
    chrome.browserAction.setBadgeText({
        text: "" + minutes
    });
  }

  function format (h, m) {
    var d = new Date();
    return (h < 10 ? "0" + h : h) + (d.getSeconds() % 2 == 0 ? ":" : ":") + (m < 10 ? "0" + m : m);
  }

  function save (found) {
    window.localStorage.setItem("schedule", JSON.stringify(found));
  }

  function distance (h1, m1, h2, m2) {
    var dh = h2 - h1, dm = m2 - m1;
    if (dh < 0) {
      dh += 24;
    }
    var dist = dh * 60 + dm;
    if (dist > 100) {
      return "";
    }
    return dist;
  }

  function refreshSchedule() {
    var name = getScheduleName();

    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    var found = reorganized[name].after(h, m);
    var dist = distance(h, m, found[0].h, found[0].m);

    badge(dist);
    save(found);
  }

  function getScheduleName () {
    return window.localStorage.getItem("rasp");
  }

  window.setInterval(refreshSchedule, 100);
})(window, chrome);