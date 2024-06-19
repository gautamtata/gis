window.PlotlyConfig = {MathJaxConfig: 'local'};
if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Config) {window.MathJax.Hub.Config({SVG: {font: "STIX-Web"}});}
if (typeof require !== 'undefined') {
    require.undef("plotly");
    define('plotly', function(require, exports, module) {
        /**
        * plotly.js v2.27.0
        * Copyright 2012-2023, Plotly, Inc.
        * All rights reserved.
        * Licensed under the MIT license
        */
        /*! For license information please see plotly.min.js.LICENSE.txt */
    });
    require(['plotly'], function(Plotly) {
        window._Plotly = Plotly;
        window.Plotly = Plotly;
    });
}