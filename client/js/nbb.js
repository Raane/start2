var bacon = require('baconjs');
var $ = require('jquery');
var hyperglue = require('hyperglue');
var moment = require('moment');
var first = require('lodash.first');
var sortBy = require('lodash.sortby');
var reduce = require('lodash.reduce');
var fs = require('fs');

var sumOl = require('../../resources/lister/sumOl.js');
var sumPenger = require('../../resources/lister/sumPenger.js');
var sumKryss = require('../../resources/lister/sumKryss.js');

var createRow = function(liste) {
  var rowTemplate = fs.readFileSync('client/templates/nbb_row.html');
  var kryss = first(liste.kryss);

  return hyperglue(rowTemplate, {
    '.dato': moment(liste.createdAt).format('HH:mm DD/MM YYYY'),
    '.ol': liste.innskudd ? '-' : sumOl(kryss, liste) + 'kr',
    '.penger': sumPenger(kryss) + 'kr',
    '.sum': sumKryss(kryss, liste) + 'kr',
    '.kommentar': liste.kommentar || ''
  });
};

var lister = bacon.fromPromise($.get('/brukere/'+$('#id').text()+'/lister'));

lister.map('.sum').assign($('.balance'), 'text');
lister.map('.highscore').assign($('.highscore'), 'text');

lister.map('.lister')
  .map(function(kryss) {
    var sorted = sortBy(kryss, '.createdAt').reverse();
    return reduce(sorted, function(acc, liste) {
      return acc + createRow(liste).outerHTML;
    },'');
  })
  .assign($('tbody'), 'html');

lister.map(Boolean).mapError(Boolean).not()
  .assign($('.loader'), 'toggle');
