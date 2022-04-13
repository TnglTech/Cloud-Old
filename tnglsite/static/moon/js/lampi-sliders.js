function setSliderValues(hue, saturation, brightness) {
  $( ".hue" ).each(function(index, hueSlider) {
    hueSlider.value = hue;
  });
  $( ".saturation" ).each(function(index, saturationSlider) {
    saturationSlider.value = saturation;
  });
  $( ".brightness" ).each(function(index, brightnessSlider) {
    brightnessSlider.value = brightness;
  });

  updateSliderStyles(hue, saturation, brightness);
}

function updateSliderStyles(hue, saturation, brightness) {
  updateSaturationSlider(hue);
  updateHueThumb(hue);
  updateSaturationThumb(hue, saturation);
  updateBrightnessThumb(brightness);
}

function updateSaturationSlider(hue) {
  color = tinycolor({ h:hue * 360, s:1.0, v:1.0 });
  hexColor = color.toHexString();

  style = '' +
  '.saturation::-webkit-slider-runnable-track {' + 
  '  background: -webkit-gradient(linear, left top, right top, color-stop(0%,#ffffff), color-stop(100%,' + hexColor + '));' + 
  '  background: -webkit-linear-gradient(left, #ffffff 0%, ' + hexColor + ' 100%); }' + 
  '.saturation::-moz-range-track {' + 
  '  background: -moz-linear-gradient(left, #ffffff 0%,' + hexColor + ' 100%); }' + 
  '.saturation::-ms-track {' + 
  '  background: -ms-linear-gradient(left, #ffffff 0%,' + hexColor + ' 100%); }';

  $( "#saturation-slider-style" ).text(style);
}

function updateThumbColor(styleSelector, rangeSelector, color) {
  borderColor = tinycolor(color.toString());
  borderColor.darken(15);

  hexColor = color.toHexString();
  hexBorderColor = borderColor.toHexString();

  style = '' +
  rangeSelector + '::-webkit-slider-thumb {' + 
  '  background-color: ' + hexColor + ';' + 
  '  border: 1px solid ' + hexBorderColor + '; }' +
  rangeSelector + '::-moz-range-thumb {' +
  '  background-color: ' + hexColor + ';' +
  '  border: 1px solid ' + hexBorderColor + '; }' +
  rangeSelector + '::-ms-thumb {' +
  '  background-color: ' + hexColor + ';' +
  '  border: 1px solid ' + hexBorderColor + '; }';

  $( styleSelector ).text(style);
}

function updateHueThumb(hue) {
  color = tinycolor({ h:hue * 360, s:1.0, v:1.0 });
  updateThumbColor("#hue-thumb-style", ".hue", color);
}

function updateSaturationThumb(hue, saturation) {
  color = tinycolor({ h:hue * 360, s:saturation, v:1.0 });
  updateThumbColor("#saturation-thumb-style", ".saturation", color);
}

function updateBrightnessThumb(brightness) {
  color = tinycolor({ h:1.0, s:0.0, v:brightness });
  updateThumbColor("#brightness-thumb-style", ".brightness", color);
}
