(function (window, document, chrome) {

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

  function refresh () {
    var raw = window.localStorage.getItem("schedule");
    var found = JSON.parse(raw);
    for (var i = 0; i < 4; ++i) {
      var td = document.getElementById('autobus_' + i);
      var d = new Date(), h = d.getHours(), m = d.getMinutes();
      td.innerHTML = format(found[i].h, found[i].m);
      if (i == 0) {
        if (distance(found[0].h, found[0].m) <= 5) {
          td.className = 'alarm';
        } else {
          td.className = 'ok';
        }
      }
    }
  }
  
  var rasp = window.localStorage.getItem("rasp");
  var tds = document.getElementsByTagName('td');
  for (i = 0; i < tds.length; ++i) {
    var td = tds[i];
    if (td.hasAttribute('data-rasp')) {
      var key = td.getAttribute('data-rasp');
      if (rasp == key) {
        td.className = 'selected';
      } else {
        td.className = '';
      }
      (function (td, key) {
        td.addEventListener("click", function () {
          document.getElementsByClassName('selected')[0].className = '';
          td.className = 'selected';
          window.localStorage.setItem("rasp", key);
        });
      })(td, key);
    }
    if (td.hasAttribute('data-msg')) {
      var msg = td.getAttribute('data-msg');
      td.innerHTML = chrome.i18n.getMessage(msg);
    }
  }

  refresh();
  window.setInterval(refresh, 100);

})(window, document, chrome);