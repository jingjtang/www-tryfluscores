(exports ? window).FS_Data = class FS_Data

  #@regions = ((if i == 0 then 'Nat' else "Reg#{i}") for i in [0..10])
  #@regions_2015 = ((if i == 0 then 'us' else "region#{i}") for i in [0..10])
  #@hhsRegions = ((if i == 0 then 'nat' else "hhs#{i}") for i in [0..10])

  #@targets_seasonal = ['onset', 'peakweek', 'peak']
  #@targets_seasonal_2015 = ['onset', 'pkwk', 'pkper']
  #@targets_local = ['1_week', '2_week', '3_week', '4_week']
  #@targets_local_2015 = ['1wk', '2wk', '3wk', '4wk']
  @errors = ['LS', 'AE']
  @error_labels = ['CDC log score', 'absolute error']
  @wILI = null

  @init = (season, competition) ->
    if @wILI != null
      return
    if season == 2014
      @epiweeks = (('' + if i <= 13 then 201440 + i else 201500 + i - 13) for i in [1..32])
      @targets_local = ['1_week', '2_week', '3_week', '4_week']
      if competition == 'National'
        @regions = ((if i == 0 then 'Nat' else "Reg#{i}") for i in [0..10])
        @targets_seasonal = ['onset', 'peakweek', 'peak']
      else if competition == 'State'
        @regions =(['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California','Colorado', 'Connecticut', 'Delaware', 'District of Columbia','Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa','Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi','Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire','New Jersey', 'New Mexico', 'New York', 'New York City','North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon','Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina','South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont','Virgin Islands', 'Virginia', 'Washington', 'West Virginia','Wisconsin', 'Wyoming'])
        @targets_seasonal = ['peakweek', 'peak']
      else
        @regions = ['0-4 yr', '18-49 yr', '5-17 yr', '50-64 yr', '65+ yr', 'Overall']
        @targets_seasonal = ['peakweek', 'peak']
    else if season in [2015, 20150, 2016, 20160, 2017, 20170]
      if competition == 'National'
        @regions = ((if i == 0 then 'us' else "region#{i}") for i in [0..10])
        @targets_seasonal = ['onset', 'pkwk', 'pkper']
      else if competition == 'State'
        @regions = (['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California','Colorado', 'Connecticut', 'Delaware', 'District of Columbia','Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa','Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland','Massachusetts', 'Michigan', 'Minnesota', 'Mississippi','Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire','New Jersey', 'New Mexico', 'New York', 'New York City','North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon','Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina','South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont','Virgin Islands', 'Virginia', 'Washington', 'West Virginia','Wisconsin', 'Wyoming'])
        @targets_seasonal = ['pkwk', 'pkper']
      else
        @regions = ['0-4 yr', '18-49 yr', '5-17 yr', '50-64 yr', '65+ yr', 'Overall']
        @targets_seasonal = ['pkwk', 'pkper']
      @targets_local = ['1wk', '2wk', '3wk', '4wk']
      if season in [2015, 20150]
        @epiweeks = (('' + if i <= 12 then 201540 + i else 201600 + i - 12) for i in [2..30])
      else if season in [2016, 20160]
        @epiweeks = (('' + if i <= 12 then 201640 + i else 201700 + i - 12) for i in [3..30])
      else if season in [2017, 20170]
        @epiweeks = (('' + if i <= 12 then 201740 + i else 201800 + i - 12) for i in [2..29])
    else if season in [2018, 20180]
      if competition == 'National'
        @regions = ((if i == 0 then "US National" else "HHS Region #{i}") for i in [0..10])
        @targets_seasonal = ['Season onset', 'Season peak week', 'Season peak percentage']
      else if competition == 'State'
        @regions = (['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California','Colorado', 'Connecticut', 'Delaware', 'District of Columbia','Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa','Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland','Massachusetts', 'Michigan', 'Minnesota', 'Mississippi','Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire','New Jersey', 'New Mexico', 'New York', 'New York City','North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon','Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina','South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont','Virgin Islands', 'Virginia', 'Washington', 'West Virginia','Wisconsin', 'Wyoming'])
        @targets_seasonal = ['Season peak week', 'Season peak percentage']
      else
        @regions = ['0-4 yr', '18-49 yr', '5-17 yr', '50-64 yr', '65+ yr', 'Overall']
        @targets_seasonal = ['Season peak week', 'Season peak percentage']
      @targets_local = ['1 wk ahead', '2 wk ahead', '3 wk ahead', '4 wk ahead']
      @epiweeks = (('' + if i <= 12 then 201840 + i else 201900 + i - 12) for i in [2..30])
    else
      throw new Error('unsupported season: ' + season)
    getCallback = (hhs, name) =>
      return (result, message, epidata) =>
        if result != 1
          console.log("Epidata API [fluview, #{hhs}] says: #{message}")
        else
          wili = (row.wili for row in epidata)
          [min, max] = [10, 0]
          for w in wili
            [min, max] = [Math.min(min, w), Math.max(max, w)]
          @wILI[name] = ((w - min) / (max - min) for w in wili)

    @targets = @targets_seasonal.concat(@targets_local)
    @wILI = { combine: [] }
    weekRange = Epidata.range(@epiweeks[0], @epiweeks[@epiweeks.length - 1])
    #for [hhs, name] in _.zip(@hhsRegions, @regions)
      #@wILI[name] = []
      #Epidata.fluview(getCallback(hhs, name), hhs, weekRange)

  @update = (data, season, error, target, region, group) ->
    totals = null
    if target == 'combine'
      targets = @targets
    else if target == 'seasonal'
      targets = @targets_seasonal
    else if target == 'local'
      targets = @targets_local
    else
      targets = [target]
    regions = if region == 'combine' then @regions else [region]
    if season in [20150, 20160, 20170, 20180]
      targets = (@targets[@targets.indexOf(t)] for t in targets)
      regions = (@regions[@regions.indexOf(r)] for r in regions)
    nr = regions.length
    nt = targets.length
    teams = (t for t of data)
    for r in regions
      for t in targets
        values = []
        for team in teams
          row = []
          for w in @epiweeks
            v = data[team][r][t][error][w]
            row.push(v / (nr * nt))
          values.push(row)
        if totals == null
          totals = values
        else
          for [src_row, dst_row] in _.zip(values, totals)
            i = 0
            while i < dst_row.length
              dst_row[i] += src_row[i]
              i++
    return totals

  transpose = (arr1) ->
    arr2 = []
    for col in arr1[0]
      arr2.push(Array(arr1.length))
    for r in [0 .. (arr1.length - 1)]
      for c in [0 .. (arr1[0].length - 1)]
        arr2[c][r] = arr1[r][c]
    return arr2

  @addAllOptions = (error, target, region) ->
    combine = { value: 'combine', text: '[average of all]' }
    seasonal = { value: 'seasonal', text: '[3 long-term]' }
    local = { value: 'local', text: '[4 short-term]' }
    addOptions(error, @errors, @error_labels)
    addOptions(target, @targets, @targets, [combine, seasonal, local])
    addOptions(region, @regions, @regions, [combine])

  addOptions = (select, values, labels, custom=[]) ->
    for c in custom
      select.append($('<option/>', { value: c.value, text: c.text }))
    for [value, text] in _.zip(values, labels)
      select.append($('<option/>', { value: value, text: text }))

  @loadFiles: (files, season, onSuccess, onFailure) ->
    # sanity checks
    if files.length == 0
      return onFailure('no files selected')
    for file in files
      if season in [2014, 2015, 2016, 2017, 2018] and !file.name.endsWith('.zip')
        return onFailure("#{file.name} is not a zip file")
      else if season in [20150, 20160, 20170, 20180] and !file.name.endsWith('.csv')
        return onFailure("#{file.name} is not a csv file")
    # load files one after another
    fileIndex = 0
    data = {}
    loadFunc = if season in [20150, 20160, 20170, 20180] then loadFull else loadSingle

    callback = (name, fileData, error, season) ->
      if error?
        return onFailure(error)
      data[name] = fileData
      if fileIndex < files.length
        loadFunc(files[fileIndex++], callback, season)
      else
        return onSuccess((t for t of data), data)
    loadFunc(files[fileIndex++], callback, season)

  loadSingle = (file, callback, season) ->
    reader = new FileReader()
    reader.onload = (event) ->
      zip = new JSZip(event.target.result)
      data = {}
      error = null
      try
        for region in FS_Data.regions
          data[region] = {}
          values = getValues(file.name, zip, region, '')
          unpackValues(data[region], values, FS_Data.targets_seasonal)
          values = getValues(file.name, zip, region, '_4wk')
          unpackValues(data[region], values, FS_Data.targets_local)
      catch ex
        error = ex.message ? '' + ex
      callback(file.name, data, error, season)
    reader.readAsArrayBuffer(file)

  unpackValues = (data, values, targets) ->
    i = 0
    for target in targets
      data[target] = {}
      for err in FS_Data.errors
        data[target][err] = {}
        for ew in FS_Data.epiweeks
          data[target][err][ew] = values[i++]

  getValues = (filename, zip, region, target) ->
    pattern = "^#{region}#{target}_Team.*\\.csv$"
    regex = new RegExp(pattern)
    for entry of zip.files
      if regex.test(entry)
        text = zip.files[entry].asText()
        return parseCSV(zip.files[entry].asText())
    throw { message: "/#{pattern}/ not in #{filename}" }

  parseCSV = (csv) ->
    fields = csv.split('\n')[1].split(',')
    fields.shift()
    fix = (n) -> if Number.isNaN(n) then -10 else n
    return (fix(parseFloat(f)) for f in fields)

  loadFull = (file, callback, season) ->
    reader = new FileReader()
    reader.onload = (event) ->
      data = {}
      error = null
      csv = event.target.result
      try
        for region in FS_Data.regions
          data[region] = {}
          for target in FS_Data.targets
            if season in [20150, 20160, 20170]
              results = []
            else if season == 20180
              results = (0 for [0...FS_Data.epiweeks.length])
            values = parseFullCSV(csv, region, target, results, season)
            unpackValues(data[region], values, [target])
      catch ex
        error = ex.message ? '' + ex
      callback(file.name, data, error, season)
    reader.readAsText(file)


  parseFullCSV = (csv, l, t, results, season) ->
    fix = (n) -> if Number.isNaN(n) then -10 else n
    AEresults = []
    headers = csv.split('\n')[0].split(',')
    cw_no = -100
    for j in [0...headers.length]
      headers[j] = '"' + headers[j] + '"'
      if headers[j].includes('location')
        loc_no = j
      else if headers[j].includes('target')
        tg_no = j
      else if headers[j].includes('score')
        ls_no = j
      else if headers[j].includes('competition_week')
        cw_no = j

    #loc_no = headers.indexOf('location')
    #tg_no = headers.indexOf('target')
    #ls_no = headers.indexOf('score')

    #if 'competition_week' in headers
    #cw_no = headers.indexOf('competitionweek')
    #else
    #cw_no = 5

    for row in csv.split('\n').slice(1)
      row = row.split(',')
      if row.length == 0
        continue
      location = '"' + row[loc_no] + '"'
      target = row[tg_no]
      ls = row[ls_no]


      if season in [20150, 20160, 20170]
        if location.includes(l) and target.includes(t)
          results.push(fix(parseFloat(ls)))
          #if row.length >= 9
            #ae = row[8]
            #AEresults.push(fix(parseFloat(ae)))
      else if season in [20180]

        #Problem with competition week hasn't been solved
        #Potential problem with inclues function (don't know why it happens occationally)
        competitionweek = row[cw_no]
        #competitionweek = row[-100]
        #if location == l and target == t
        if location.includes(l) and target.includes(t)
          #results.push(fix(parseFloat(ls)))
          results[competitionweek-1] = fix(parseFloat(ls))
          # No AEresults for 2018
    if AEresults.length == 0
      # pad the abs err scores with 0s. to change when AE scores are available
      for i in [0...results.length]
        results.push(0)
    else
      results = results.concat(AEresults)
    return results
