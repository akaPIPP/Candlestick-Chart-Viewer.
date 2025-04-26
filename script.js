let chart;
let annotations = [];

// This function fetches the data and updates the chart
async function fetchData() {
    const loadingSpinner = document.getElementById('loading');
    loadingSpinner.classList.remove('hidden');  // Show the spinner

    const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${currentInterval}&limit=100`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const seriesData = data.map(candle => {
            return {
                x: new Date(candle[0]),
                y: [
                    parseFloat(candle[1]),
                    parseFloat(candle[2]),
                    parseFloat(candle[3]),
                    parseFloat(candle[4])
                ]
            };
        });

        if (chart) {
            chart.updateSeries([{ data: seriesData }]);
        } else {
            drawChart(seriesData);
        }
    } catch (err) {
        console.log('Error fetching data:', err);
    } finally {
        loadingSpinner.classList.add('hidden');  // Hide the spinner after fetching
    }
}

// This function draws the chart
function drawChart(seriesData) {
    const options = {
        chart: {
            type: 'candlestick',
            height: 500,
            background: '#1e1e1e',
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true,
                type: 'xy', // Enable zooming in both x and y axes
            },
            pan: {
                enabled: true,
                type: 'xy', // Enable panning in both x and y axes
                threshold: 10
            },
            events: {
                // Handle the mouse click for drawing tools
                click: function(event, chartContext, config) {
                    if (drawingMode) {
                        handleDrawing(event);
                    }
                }
            }
        },
        title: {
            text: `Bitcoin (BTC/USDT) - ${currentInterval} Candles`,
            align: 'left',
            style: {
                color: '#fff'
            }
        },
        annotations: {
            xaxis: [],
            yaxis: [],
            points: []
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#aaa'
                }
            }
        },
        yaxis: {
            tooltip: {
                enabled: true
            },
            labels: {
                style: {
                    colors: '#aaa'
                }
            }
        },
        tooltip: {
            theme: 'dark'
        },
        series: [{
            data: seriesData
        }]
    };
    chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
}

let currentInterval = '1h';

function changeTimeframe() {
    const selectedInterval = document.getElementById('timeframe').value;
    currentInterval = selectedInterval;
    fetchData();
}

// Fetch data immediately on page load
fetchData();

// Refresh data every 60 seconds
setInterval(fetchData, 60000);

function setTimeframe(interval) {
    currentInterval = interval;
    fetchData();
    highlightActiveButton(interval);
}

function generateSampleData() {
    let data = [];
    let now = Date.now();
    for (let i = 0; i < 50; i++) {
        data.push([now - (50 - i) * 1000, Math.random() * 10000 + 10000, Math.random() * 10000 + 10000, Math.random() * 10000 + 10000, Math.random() * 10000 + 10000]);
    }
    return data;
}

function initChart() {
    chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
    fetchData();
}

let drawingMode = null;

function enableFibonacci() {
    drawingMode = 'fibonacci';
    alert("Fibonacci tool activated. Click to add points.");
}

function enableTrendline() {
    drawingMode = 'trendline';
    alert("Trendline tool activated. Click to add points.");
}

document.querySelector("#chart").addEventListener('click', function(event) {
    if(drawingMode === 'fibonacci') {
        const x = event.offsetX;
        const y = event.offsetY;
        const seriesData = chart.w.globals.series[0];
        
        chart.addXaxisAnnotation({
            x: seriesData[0].x,
            strokeColor: '#00d09c',
            width: 2
        });
    }else if (drawingMode === 'trendline') {
        const x = event.offsetX;
        const y = event.offsetY;
        chart.addYaxisAnnotation({
            y: y,
            strokeColor: '#ff0000',
            width: 2
        });
    }
});

    window.onload = function() {
        initChart();
    }

function moveUnderline() {
    const activeButton = document.getElementById(`btn-${currentInterval}`);
    const underline = document.querySelector('.underline');
    if (activeButton && underline) {
        underline.style.width = `${activeButton.offsetWidth}px`;
        underline.style.left = `${activeButton.offsetLeft}px`;
    }  
}

window.onload = () => {
    fetchData();
    moveUnderline();
};

window.addEventListener('resize', moveUnderline);

function highlightActiveButton(interval) {
    const buttons = document.querySelectorAll('#timeframes button');
    const underline = document.querySelector('.underline');
    buttons.forEach(button => {
        if (button.innerText.toLowerCase() === interval) {
            button.classList.add('active');
            
            const rect = button.getBoundingClientRect();
            const containerRect = button.parentElement.getBoundingClientRect();
            if (underline) {
                underline.style.width = `${rect.width}px`;
                underline.style.left = `${rect.left - containerRect.left}px`;
            }
        } else {
            button.classList.remove('active');
        }
    });
}
