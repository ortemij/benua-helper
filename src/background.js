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
        [7, [40, 48, 56]],
        [8, [4, 12, 20, 28, 36, 44, 52]],
        [9, [0, 8, 16, 24, 32, 40, 48, 56]],
        [10, [4, 12, 20, 28, 36, 44, 52]],
        [11, [0, 8, 16, 24, 32, 40, 48, 56]],
        [12, [4, 12, 18, 30, 42, 54]],
        [13, [6, 18, 30, 42, 54]],
        [14, [20, 40]],
        [15, [0, 20, 40]],
        [16, [0, 20, 40]],
        [17, [0, 8, 16, 24, 32, 40, 48, 56]],
        [18, [4, 12, 20, 28, 36, 44, 52]],
        [19, [0, 8, 16, 24, 32, 40, 48, 56]],
        [20, [4, 12, 20, 40]],
        [21, [0, 20, 40]],
        [22, [0, 20, 40]],
        [23, [0, 30]]
      ],
    lenina_benua: 
      [
        [7, [20, 28, 36, 44, 52]],
        [8, [0, 8, 16, 24, 32, 40, 48, 56]],
        [9, [4, 12, 20, 28, 36, 44, 52]],
        [10, [0, 8, 16, 24, 32, 40, 48, 56]],
        [11, [4, 12, 20, 28, 36, 44, 52]],
        [12, [0, 12, 24, 36, 48]],
        [13, [0, 12, 24, 36, 48]],
        [14, [0, 20, 40]],
        [15, [0, 20, 40]],
        [16, [0, 20, 40, 56]],
        [17, [20, 28, 36, 44, 52]],
        [18, [0, 8, 16, 24, 32, 40, 48, 56]],
        [19, [4, 12, 20, 28, 36, 44, 52]],
        [20, [0, 20, 40]],
        [21, [0, 20, 40]],
        [22, [0, 20, 40]],
        [23, [15]]
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

  function Schedule() {
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
    benua_lenina: new Schedule(),
    lenina_benua: new Schedule(),
    benua_novocherkasskaya: new Schedule(),
    novocherkasskaya_benua: new Schedule()
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

  function getScheduleName () {
    return window.localStorage.getItem("rasp");
  }

  function handleMessage(message, sender, sendResponse) {
    if ('getSchedule' === message) {
      var schedule = getNextBusesList();
      sendResponse(schedule);
    } else if ('updateBadge' === message) {
      updateBadge();
    }
  }

  function getNextBusesList() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    var name = getScheduleName();
    var nextBuses = reorganized[name].after(h, m);
    return nextBuses;
  }

  function updateBadge() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    var nextBuses = getNextBusesList();
    var nextBus = nextBuses[0];
    var minutesTillNextBus = distance(h, m, nextBus.h, nextBus.m);
    badge(minutesTillNextBus);
  }

  /**
   * @return {number} Integer number of seconds till next minute [1; 60].
   */
  function getNumberOfSecondsTillNextMinute() {
    var nowDate = new Date();
    return 60 - nowDate.getSeconds();
  }

  function cleanUpLocalStorage() {
    localStorage.removeItem('schedule');
  }

  function init() {
    // Support old versions of Chrome/Chromium/Yandex.Browser (28-).
    var onMessage = chrome.runtime.onMessage ?
        chrome.runtime.onMessage :
        chrome.extension.onMessage;

    // Listen for request from popup.
    onMessage.addListener(handleMessage);

    // Clean up localStorage on extension update.
    chrome.runtime.onInstalled.addListener(function(details) {
      if (details.reason === 'update') {
        cleanUpLocalStorage();
      }
    });

    // Update now.
    updateBadge();

    // Update on next minute start.
    setTimeout(function() {
      updateBadge();

      // And every minute after.
      setInterval(updateBadge, 60 * 1000);

      // XXX(alexeykuzmin): `chrome.alarms` fires events not very precisely.
    }, getNumberOfSecondsTillNextMinute() * 1000);
  }

  init();

})(window, chrome);
