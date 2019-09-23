// Generated by CoffeeScript 2.4.1
(function() {
  var FS_Data;

  (typeof exports !== "undefined" && exports !== null ? exports : window).FS_Data = FS_Data = (function() {
    var addOptions, getValues, i, loadFull, loadSingle, parseCSV, parseFullCSV, transpose, unpackValues;

    class FS_Data {
      static init(season) {
        var getCallback, hhs, j, len, name, ref, results1, weekRange;
        if (this.wILI !== null) {
          return;
        }
        if (season === 2014) {
          this.epiweeks = (function() {
            var j, results1;
            results1 = [];
            for (i = j = 1; j <= 32; i = ++j) {
              results1.push('' + (i <= 13 ? 201440 + i : 201500 + i - 13));
            }
            return results1;
          })();
        } else if (season === 2015 || season === 20150 || season === 2016 || season === 20160 || season === 2017 || season === 20170) {
          this.epiweeks = (function() {
            var j, results1;
            results1 = [];
            for (i = j = 2; j <= 30; i = ++j) {
              results1.push('' + (i <= 12 ? 201540 + i : 201600 + i - 12));
            }
            return results1;
          })();
        } else if (season === 2016 || season === 20160) {
          this.epiweeks = (function() {
            var j, results1;
            results1 = [];
            for (i = j = 3; j <= 30; i = ++j) {
              results1.push('' + (i <= 12 ? 201640 + i : 201700 + i - 12));
            }
            return results1;
          })();
        } else if (season === 2017 || season === 20170) {
          this.epiweeks = (function() {
            var j, results1;
            results1 = [];
            for (i = j = 2; j <= 29; i = ++j) {
              results1.push('' + (i <= 12 ? 201740 + i : 201800 + i - 12));
            }
            return results1;
          })();
        } else if (season === 2018 || season === 20180) {
          this.epiweeks = (function() {
            var j, results1;
            results1 = [];
            for (i = j = 2; j <= 30; i = ++j) {
              results1.push('' + (i <= 12 ? 201840 + i : 201900 + i - 12));
            }
            return results1;
          })();
        } else {
          throw new Error('unsupported season: ' + season);
        }
        getCallback = (hhs, name) => {
          return (result, message, epidata) => {
            var j, len, max, min, row, w, wili;
            if (result !== 1) {
              return console.log(`Epidata API [fluview, ${hhs}] says: ${message}`);
            } else {
              wili = (function() {
                var j, len, results1;
                results1 = [];
                for (j = 0, len = epidata.length; j < len; j++) {
                  row = epidata[j];
                  results1.push(row.wili);
                }
                return results1;
              })();
              [min, max] = [10, 0];
              for (j = 0, len = wili.length; j < len; j++) {
                w = wili[j];
                [min, max] = [Math.min(min, w), Math.max(max, w)];
              }
              return this.wILI[name] = (function() {
                var k, len1, results1;
                results1 = [];
                for (k = 0, len1 = wili.length; k < len1; k++) {
                  w = wili[k];
                  results1.push((w - min) / (max - min));
                }
                return results1;
              })();
            }
          };
        };
        this.wILI = {
          combine: []
        };
        weekRange = Epidata.range(this.epiweeks[0], this.epiweeks[this.epiweeks.length - 1]);
        ref = _.zip(this.hhsRegions, this.regions);
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          [hhs, name] = ref[j];
          this.wILI[name] = [];
          results1.push(Epidata.fluview(getCallback(hhs, name), hhs, weekRange));
        }
        return results1;
      }

      static update(data, season, error, target, region, group) {
        var dst_row, j, k, len, len1, len2, len3, len4, m, nr, nt, o, p, r, ref, ref1, regions, row, src_row, t, targets, team, teams, totals, v, values, w;
        totals = null;
        if (target === 'combine') {
          targets = this.targets;
        } else if (target === 'seasonal') {
          targets = this.targets_seasonal;
        } else if (target === 'local') {
          targets = this.targets_local;
        } else {
          targets = [target];
        }
        regions = region === 'combine' ? this.regions : [region];
        if (season === 20150 || season === 20160 || season === 20170 || season === 20180) {
          targets = (function() {
            var j, len, results1;
            results1 = [];
            for (j = 0, len = targets.length; j < len; j++) {
              t = targets[j];
              results1.push(this.targets[this.targets.indexOf(t)]);
            }
            return results1;
          }).call(this);
          regions = (function() {
            var j, len, results1;
            results1 = [];
            for (j = 0, len = regions.length; j < len; j++) {
              r = regions[j];
              results1.push(this.regions[this.regions.indexOf(r)]);
            }
            return results1;
          }).call(this);
        }
        nr = regions.length;
        nt = targets.length;
        teams = (function() {
          var results1;
          results1 = [];
          for (t in data) {
            results1.push(t);
          }
          return results1;
        })();
        for (j = 0, len = regions.length; j < len; j++) {
          r = regions[j];
          for (k = 0, len1 = targets.length; k < len1; k++) {
            t = targets[k];
            values = [];
            for (m = 0, len2 = teams.length; m < len2; m++) {
              team = teams[m];
              row = [];
              ref = this.epiweeks;
              for (o = 0, len3 = ref.length; o < len3; o++) {
                w = ref[o];
                v = data[team][r][t][error][w];
                row.push(v / (nr * nt));
              }
              values.push(row);
            }
            if (totals === null) {
              totals = values;
            } else {
              ref1 = _.zip(values, totals);
              for (p = 0, len4 = ref1.length; p < len4; p++) {
                [src_row, dst_row] = ref1[p];
                i = 0;
                while (i < dst_row.length) {
                  dst_row[i] += src_row[i];
                  i++;
                }
              }
            }
          }
        }
        return totals;
      }

      static addAllOptions(error, target, region) {
        var combine, local, seasonal;
        combine = {
          value: 'combine',
          text: '[average of all]'
        };
        seasonal = {
          value: 'seasonal',
          text: '[3 long-term]'
        };
        local = {
          value: 'local',
          text: '[4 short-term]'
        };
        addOptions(error, this.errors, this.error_labels);
        addOptions(target, this.targets, this.targets, [combine, seasonal, local]);
        return addOptions(region, this.regions, this.regions, [combine]);
      }

      static loadFiles(files, season, onSuccess, onFailure) {
        var callback, data, file, fileIndex, j, len, loadFunc;
        // sanity checks
        if (files.length === 0) {
          return onFailure('no files selected');
        }
        for (j = 0, len = files.length; j < len; j++) {
          file = files[j];
          if ((season === 2014 || season === 2015 || season === 2016 || season === 2017 || season === 2018) && !file.name.endsWith('.zip')) {
            return onFailure(`${file.name} is not a zip file`);
          } else if ((season === 20150 || season === 20160 || season === 20170 || season === 20180) && !file.name.endsWith('.csv')) {
            return onFailure(`${file.name} is not a csv file`);
          }
        }
        // load files one after another
        fileIndex = 0;
        data = {};
        loadFunc = season === 20150 || season === 20160 || season === 20170 || season === 20180 ? loadFull : loadSingle;
        callback = function(name, fileData, error, season) {
          var t;
          if (error != null) {
            return onFailure(error);
          }
          data[name] = fileData;
          if (fileIndex < files.length) {
            return loadFunc(files[fileIndex++], callback, season);
          } else {
            return onSuccess((function() {
              var results1;
              results1 = [];
              for (t in data) {
                results1.push(t);
              }
              return results1;
            })(), data);
          }
        };
        return loadFunc(files[fileIndex++], callback, season);
      }

    };

    //@regions = ((if i == 0 then 'Nat' else "Reg#{i}") for i in [0..10])
    //@regions_2015 = ((if i == 0 then 'us' else "region#{i}") for i in [0..10])
    if (season === 2014) {
      FS_Data.regions = (function() {
        var j, results1;
        results1 = [];
        for (i = j = 0; j <= 10; i = ++j) {
          results1.push(i === 0 ? 'Nat' : `Reg${i}`);
        }
        return results1;
      })();
      FS_Data.targets_seasonal = ['onset', 'peakweek', 'peak'];
      FS_Data.targets_local = ['1_week', '2_week', '3_week', '4_week'];
    } else if (season === 2015 || season === 20150 || season === 2016 || season === 20160 || season === 2017 || season === 20170) {
      FS_Data.regions = (function() {
        var j, results1;
        results1 = [];
        for (i = j = 0; j <= 10; i = ++j) {
          results1.push(i === 0 ? 'us' : `region${i}`);
        }
        return results1;
      })();
      FS_Data.targets_seasonal = ['onset', 'pkwk', 'pkper'];
      FS_Data.targets_local = ['1wk', '2wk', '3wk', '4wk'];
    } else if (season === 2018 || season === 20180) {
      FS_Data.regions = (function() {
        var j, results1;
        results1 = [];
        for (i = j = 0; j <= 10; i = ++j) {
          results1.push(i === 0 ? "US National" : `HHS Region ${i}`);
        }
        return results1;
      })();
      FS_Data.targets_seasonal = ['Season onset', 'Season peak week', 'Season peak percentage'];
      FS_Data.targets_local = ['1 wk ahead', '2 wk ahead', '3 wk ahead', '4 wk ahead'];
    }

    FS_Data.hhsRegions = (function() {
      var j, results1;
      results1 = [];
      for (i = j = 0; j <= 10; i = ++j) {
        results1.push(i === 0 ? 'nat' : `hhs${i}`);
      }
      return results1;
    })();

    //@targets_seasonal = ['onset', 'peakweek', 'peak']
    //@targets_seasonal_2015 = ['onset', 'pkwk', 'pkper']
    //@targets_local = ['1_week', '2_week', '3_week', '4_week']
    //@targets_local_2015 = ['1wk', '2wk', '3wk', '4wk']
    FS_Data.targets = FS_Data.targets_seasonal.concat(FS_Data.targets_local);

    FS_Data.errors = ['LS', 'AE'];

    FS_Data.error_labels = ['CDC log score', 'absolute error'];

    FS_Data.wILI = null;

    transpose = function(arr1) {
      var arr2, c, col, j, k, len, m, r, ref, ref1, ref2;
      arr2 = [];
      ref = arr1[0];
      for (j = 0, len = ref.length; j < len; j++) {
        col = ref[j];
        arr2.push(Array(arr1.length));
      }
      for (r = k = 0, ref1 = arr1.length - 1; (0 <= ref1 ? k <= ref1 : k >= ref1); r = 0 <= ref1 ? ++k : --k) {
        for (c = m = 0, ref2 = arr1[0].length - 1; (0 <= ref2 ? m <= ref2 : m >= ref2); c = 0 <= ref2 ? ++m : --m) {
          arr2[c][r] = arr1[r][c];
        }
      }
      return arr2;
    };

    addOptions = function(select, values, labels, custom = []) {
      var c, j, k, len, len1, ref, results1, text, value;
      for (j = 0, len = custom.length; j < len; j++) {
        c = custom[j];
        select.append($('<option/>', {
          value: c.value,
          text: c.text
        }));
      }
      ref = _.zip(values, labels);
      results1 = [];
      for (k = 0, len1 = ref.length; k < len1; k++) {
        [value, text] = ref[k];
        results1.push(select.append($('<option/>', {
          value: value,
          text: text
        })));
      }
      return results1;
    };

    loadSingle = function(file, callback, season) {
      var reader;
      reader = new FileReader();
      reader.onload = function(event) {
        var data, error, ex, j, len, ref, ref1, region, values, zip;
        zip = new JSZip(event.target.result);
        data = {};
        error = null;
        try {
          ref = FS_Data.regions;
          for (j = 0, len = ref.length; j < len; j++) {
            region = ref[j];
            data[region] = {};
            values = getValues(file.name, zip, region, '');
            unpackValues(data[region], values, FS_Data.targets_seasonal, season);
            values = getValues(file.name, zip, region, '_4wk');
            unpackValues(data[region], values, FS_Data.targets_local, season);
          }
        } catch (error1) {
          ex = error1;
          error = (ref1 = ex.message) != null ? ref1 : '' + ex;
        }
        return callback(file.name, data, error, season);
      };
      return reader.readAsArrayBuffer(file);
    };

    unpackValues = function(data, values, targets, season) {
      var err, ew, j, len, results1, target;
      i = 0;
      results1 = [];
      for (j = 0, len = targets.length; j < len; j++) {
        target = targets[j];
        data[target] = {};
        if (season === 20150 || season === 20160 || season === 20170) {
          results1.push((function() {
            var k, len1, ref, results2;
            ref = FS_Data.errors;
            results2 = [];
            for (k = 0, len1 = ref.length; k < len1; k++) {
              err = ref[k];
              data[target][err] = {};
              results2.push((function() {
                var len2, m, ref1, results3;
                ref1 = FS_Data.epiweeks;
                results3 = [];
                for (m = 0, len2 = ref1.length; m < len2; m++) {
                  ew = ref1[m];
                  results3.push(data[target][err][ew] = values[i++]);
                }
                return results3;
              })());
            }
            return results2;
          })());
        } else if (season === 20180) {
          results1.push((function() {
            var k, len1, ref, results2;
            ref = FS_Data.epiweeks;
            results2 = [];
            for (k = 0, len1 = ref.length; k < len1; k++) {
              ew = ref[k];
              results2.push(data[target][ew] = values[i++]);
            }
            return results2;
          })());
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    };

    getValues = function(filename, zip, region, target) {
      var entry, pattern, regex, text;
      pattern = `^${region}${target}_Team.*\\.csv$`;
      regex = new RegExp(pattern);
      for (entry in zip.files) {
        if (regex.test(entry)) {
          text = zip.files[entry].asText();
          return parseCSV(zip.files[entry].asText());
        }
      }
      throw {
        message: `/${pattern}/ not in ${filename}`
      };
    };

    parseCSV = function(csv) {
      var f, fields, fix;
      fields = csv.split('\n')[1].split(',');
      fields.shift();
      fix = function(n) {
        if (Number.isNaN(n)) {
          return -10;
        } else {
          return n;
        }
      };
      return (function() {
        var j, len, results1;
        results1 = [];
        for (j = 0, len = fields.length; j < len; j++) {
          f = fields[j];
          results1.push(fix(parseFloat(f)));
        }
        return results1;
      })();
    };

    loadFull = function(file, callback, season) {
      var reader;
      reader = new FileReader();
      reader.onload = function(event) {
        var csv, data, error, ex, j, k, len, len1, ref, ref1, ref2, region, results, target, values;
        data = {};
        error = null;
        csv = event.target.result;
        try {
          ref = FS_Data.regions;
          for (j = 0, len = ref.length; j < len; j++) {
            region = ref[j];
            data[region] = {};
            ref1 = FS_Data.targets;
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              target = ref1[k];
              if (season === 20150 || season === 20160 || season === 20170) {
                results = [];
              } else if (season === 20180) {
                results = (function() {
                  var m, ref2, results1;
                  results1 = [];
                  for (m = 0, ref2 = FS_Data.epiweeks.length; (0 <= ref2 ? m < ref2 : m > ref2); 0 <= ref2 ? m++ : m--) {
                    results1.push(0);
                  }
                  return results1;
                })();
              }
              values = parseFullCSV(csv, region, target, results, season);
              unpackValues(data[region], values, [target]);
            }
          }
        } catch (error1) {
          ex = error1;
          error = (ref2 = ex.message) != null ? ref2 : '' + ex;
        }
        return callback(file.name, data, error, season);
      };
      return reader.readAsText(file);
    };

    parseFullCSV = function(csv, l, t, results, season) {
      var AEresults, ae, competitionweek, fix, j, k, len, location, ls, ref, ref1, row, target;
      fix = function(n) {
        if (Number.isNaN(n)) {
          return -10;
        } else {
          return n;
        }
      };
      AEresults = [];
      ref = csv.split('\n').slice(1);
      for (j = 0, len = ref.length; j < len; j++) {
        row = ref[j];
        row = row.split(',');
        if (row.length === 0) {
          continue;
        }
        if (season === 20150 || season === 20160 || season === 20170) {
          location = row[1];
          target = row[2];
          ls = row[7];
        } else if (season === 20180) {
          location = row[0];
          target = row[1];
          ls = row[2];
          competitionweek = row[5];
        }
        if (location === l && target === t) {
          if (season === 20150 || season === 20160 || season === 20170) {
            results.push(fix(parseFloat(ls)));
            if (row.length >= 9) {
              ae = row[8];
              AEresults.push(fix(parseFloat(ae)));
            }
          } else if (season === 20180) {
            results[competitionweek - 1] = fix(parseFloat(ls));
          }
        }
      }
      // No AEresults for 2018
      if (AEresults.length === 0) {
// pad the abs err scores with 0s. to change when AE scores are available
        for (i = k = 0, ref1 = results.length; (0 <= ref1 ? k < ref1 : k > ref1); i = 0 <= ref1 ? ++k : --k) {
          results.push(0);
        }
      } else {
        results = results.concat(AEresults);
      }
      return results;
    };

    return FS_Data;

  }).call(this);

}).call(this);
