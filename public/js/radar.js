// 雷达图构造器对象-->用户调用
window.RADAR = {};
// 雷达图构造方法
RADAR.init = function (element, options) {
    (new RadarFactory(element, options)).init();
};

// 雷达图构造函数
const RadarFactory = function (element, options) {
    this.init = function () {};

    // 获取屏幕分辨率
    function getRatio(context) {
        let devicePixelRatio = window.devicePixelRatio || 1;
        let backingStorePixelRatio = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        let ratio = devicePixelRatio / backingStorePixelRatio;
        return ratio;
    }

    // 初始化雷达DOM构建
    if (element) {
        let elementWidth = element.offsetWidth,
            elementHeight = element.offsetHeight,
            elementOffsetLeft = element.offsetLeft,
            elementOffsetTop = element.offsetTop;

        // 创建canvas对象，初始化canvas的宽高
        let canvas = document.createElement("canvas");
        element.appendChild(canvas);
        // let canvas = element.getElementsByTagName("canvas")[0];
        let context = canvas.getContext("2d");
        let ratio = getRatio(context) || 1; // 屏幕分辨率

        canvas.width = elementWidth * ratio;
        canvas.height = elementHeight * ratio;

        canvas.style.width = elementWidth + "px";
        canvas.style.height = elementHeight + "px";

        // config参数初始化默认值
        // 给userConfig补全默认值
        let userConfig = setDefaultValueObj({
            scale: 1,
            origin: [canvas.width / 2, canvas.height / 2],
            showTooltip: false
        }, options.config);
        let defaultRadius = Math.min(canvas.width, canvas.height) * 0.5 * 0.6 * userConfig.scale; // 正多边形的默认半径
        userConfig.radius = userConfig.radius ? userConfig.radius : defaultRadius,

            // 背景图的config设置默认参数
            userConfig.bg = setDefaultValueObj({
                layer: 7,
                evenFillStyle: "#fff",
                oddFillStyle: "#eee",
                evenStrokeStyle: "transparent",
                oddStrokeStyle: "transparent",
                axisColor:'rgba(0,0,0,0.5)'
            }, userConfig.bg);

        // 数据填充多边形的config设置参数
        userConfig.dataFill = setDefaultValueObj({
            fillStyle: "transparent"
        }, userConfig.dataFill);

        // 数据线条的config设置参数
        userConfig.dataLine = setDefaultValueObj({
            strokeStyle: "red",
            lineWidth: 2 * ratio
        }, userConfig.dataLine);

        // 数据点圆圈的config设置参数
        userConfig.dataCircle = setDefaultValueObj({
            r: 2 * ratio,
            strokeStyle: "red",
            lineWidth: 2 * ratio,
            fillStyle: "#fff"
        }, userConfig.dataCircle);

        // tooltip的config设置参数
        userConfig.tooltip = setDefaultValueObj({
            r: userConfig.dataCircle.r,
            offsetX: 0,
            offsetY: 0
        }, userConfig.tooltip);

        // 文字样式的config设置参数
        userConfig.font = setDefaultValueObj({
            fontStyle: 12 * ratio + "px Pingfang SC,STHeiti,Lantinghei SC,Open Sans,Arial,Hiragino Sans GB,Microsoft YaHei,WenQuanYi Micro Hei,SimSun,sans-serif",
            fontColor: "#000"
        }, userConfig.font);





        // data参数初始化默认值
        let data = setDefaultValueObj({
            description: [],
            tooltipsString: [],
            maxValue: [],
            // 所有的内部多边形
            inner: []
        }, options.data);

        // 构建程序需要的基本数据对象
        // userConfig-->baseConfig
        let baseConfig = {};

        function constructBaseConfig() {
            let dataLength = data.maxValue ? data.maxValue.length : 0;
            baseConfig.n = dataLength; // 正多边形的边数
            baseConfig.dataRadiusOfPercent = [];
            baseConfig.dataRadius = [];
            baseConfig.inner = [];
            baseConfig.angleArr = [];
            baseConfig.tooltipsContentArr = [];
            // console.log(dataLength);
            let disAngle = Math.PI * 2 / baseConfig.n;

            for (let loop of data.inner) {


                let dataRadiusOfPercent = []
                let dataRadius = []


                for (let i = 0; i < dataLength; i++) {
                    dataRadiusOfPercent[i] = loop.value[i] / data.maxValue[i];
                    dataRadius[i] = loop.value[i] / data.maxValue[i] * userConfig.radius;
                    baseConfig.angleArr[i] = i * disAngle;



                    // 构建气泡显示数据初始化
                    if (userConfig.showTooltip) {
                        if (typeof data.tooltipsString == "function") {
                            baseConfig.tooltipsContentArr.push(data.tooltipsString(data.description[i], data.value[i], data.maxValue[i]));
                        } else if (typeof data.tooltipsString == "String") {
                            baseConfig.tooltipsContentArr.push(data.tooltipsString);
                        } else {
                            baseConfig.tooltipsContentArr.push(loop.name + ": <br>" + "max: " + data.maxValue[i] + "<br>" + "now：" + loop.value[i]);
                        }
                    }
                }


                baseConfig.inner.push({
                    dataRadiusOfPercent,
                    dataRadius,
                    strokeStyle: loop.strokeStyle,
                    lineColor: loop.lineColor,
                    fillColor: loop.fillColor,
                    lineWidth: loop.lineWidth,
                    name: loop.name
                })


            }



        }

        // 初始化雷达图对象
        this.init = function () {
            // 初始化参数配置
            constructBaseConfig();
            // 初始化雷达图元素的基本样式
            element.style.position = "relative";

            drawCanvasAnimation();

            /*        // 绘制数据线条
                    drawDataLine({
                        dataPoints: dataPointsPosArray,
                        strokeStyle: userConfig.dataLine.strokeStyle,
                        lineWidth: userConfig.dataLine.lineWidth
                    });

                    // 绘制数据多边形填充
                    drawDataFill({
                        dataPoints: dataPointsPosArray,
                        fillStyle: userConfig.dataFill.fillStyle
                    });

                    // 绘制数据点圆圈
                    drawDataCircle({
                        dataPoints: dataPointsPosArray,
                        r: userConfig.dataCircle.r,
                        strokeStyle: userConfig.dataCircle.strokeStyle,
                        fillStyle: userConfig.dataCircle.fillStyle,
                        lineWidth: userConfig.dataCircle.lineWidth
                    });*/

            // 绘制tooltips
            if (userConfig.showTooltip) {
                // 构建气泡显示元素
                baseConfig.tooltipEle = document.createElement("div");
                baseConfig.tooltipEle.className = "radar-tooltips";
                baseConfig.tooltipEle.style.position = "absolute";
                baseConfig.tooltipEle.style.display = "none";
                element.appendChild(baseConfig.tooltipEle);

                // 绘制tooltips
                checkIsDataCircle({
                    tooltipEle: element.getElementsByClassName("radar-tooltips")[0],
                    tootipContentArray: baseConfig.tooltipsContentArr,
                    tooltipOffsetX: userConfig.tooltip.offsetX,
                    tooltipOffsetY: userConfig.tooltip.offsetY,
                    dataCircleRadius: userConfig.tooltip.r
                });
            }
        };

        function drawCanvasAnimation() {
            let radiusPrecent = 0;
            let timer = null;

            // console.log(userConfig);
            // console.log(baseConfig);


            (function drawFrame() {
                timer = window.requestAnimationFrame(drawFrame, canvas);
                // 数据点坐标元素 userConfig.radius
                // 动画帧调用20次
                radiusPrecent += 0.05;
                if (radiusPrecent >= 1) {
                    window.cancelAnimationFrame(timer);
                }




                let dataRadius = baseConfig.dataRadius.map(function (value, index) {
                    return value * radiusPrecent;
                });
                let dataPointsPosArray = getDataPointsPos(baseConfig.n, userConfig.radius, dataRadius, baseConfig.angleArr);


                // 清空画布
                context.clearRect(0, 0, canvas.width, canvas.height);
                // 书写文字
                drawText({
                    n: baseConfig.n,
                    r: userConfig.radius,
                    data: data.description,
                    origin: userConfig.origin,
                    fontStyle: userConfig.font.fontStyle,
                    fontColor: userConfig.font.fontColor
                });

                // 绘制背景图
                drawRadarBackground({
                    layer: userConfig.bg.layer,
                    n: baseConfig.n,
                    r: userConfig.radius,
                    origin: userConfig.origin,
                    evenFillStyle: userConfig.bg.evenFillStyle,
                    oddFillStyle: userConfig.bg.oddFillStyle,
                    evenStrokeStyle: userConfig.bg.evenStrokeStyle,
                    oddStrokeStyle: userConfig.bg.oddStrokeStyle,
                    axisColor:userConfig.bg.axisColor
                });

                // // 绘制数据多边形
                for (let loop of baseConfig.inner) {
                    let instantRadius = loop.dataRadius.map(function (value, index) {
                        return value * radiusPrecent;
                    });
                    let pointArr = getDataPointsPos(baseConfig.n, userConfig.radius, instantRadius, baseConfig.angleArr);
                    drawDataPoly({
                        // 点
                        dataCircleOptions: {
                            dataPoints: pointArr,
                            r: userConfig.showTooltip ? loop.lineWidth + 1 : 0,
                            // strokeStyle: loop.strokeStyle,
                            fillColor: loop.lineColor,
                            // lineWidth: userConfig.dataCircle.lineWidth
                        },
                        // 线
                        dataLineOptions: {
                            dataPoints: pointArr,
                            lineColor: loop.lineColor,
                            lineWidth: loop.lineWidth
                        },
                        // 面
                        dataFillOptions: {
                            dataPoints: pointArr,
                            fillColor: loop.fillColor
                        }
                    })
                }






            })();
        }

        // 获取正多边形每个点的坐标位置数组（相对于坐标）
        this.getPolygonPos = function () {
            getPolygonPos(baseConfig.n, userConfig.radius, userConfig.origin);
        };

        /**
         * 设置对象的默认属性值
         * @param {[Object]} defalutObj [默认值对象]
         * @param {[Object]} formerObj  [原对象]
         */
        function setDefaultValueObj(defalutObj, formerObj) {
            // 先敷上一层default, 再覆盖用户数据, 得出新对象
            let resultObj = {};
            for (let i in defalutObj) {
                resultObj[i] = defalutObj[i];
            }
            for (let i in formerObj) {
                resultObj[i] = formerObj[i];
            }
            return resultObj;
        }

        /**
         * 获取数据点相对于原点的坐标
         * n：多边形边数
         * r: 多边形半径
         * dataRadiusArr: 数据点的坐标数组
         * angleArr: 多边形的角度数组
         */
        function getDataPointsPos(nn, rr, d, a) {
            // 极坐标->直角坐标
            let n = nn ? nn : 6,
                r = rr ? rr : 50,
                dataRadiusArr = d ? d : [],
                angleArr = a ? a : [];
            let dataPointsPosArray = [];
            for (let i = 0; i < n; i++) {
                let curPoinrPos = {};
                curPoinrPos.x = dataRadiusArr[i] * Math.sin(angleArr[i]);
                curPoinrPos.y = -dataRadiusArr[i] * Math.cos(angleArr[i]);
                // console.log("curPoinrPos: " + curPoinrPos.x + "; " + curPoinrPos.y);
                dataPointsPosArray.push(curPoinrPos);
            }
            return dataPointsPosArray;
        }

        /**
         * 绘制数据点组成的图案
         * dataLineOptions
         * dataFillOptions
         * dataCircleOptions
         */
        function drawDataPoly(options) {
            // 绘制内部的多边形
            let dataLineOptions = options.dataLineOptions || {},
                dataFillOptions = options.dataFillOptions || {},
                dataCircleOptions = options.dataCircleOptions || {};
            // 绘制数据点圆圈
            drawDataCircle(dataCircleOptions);
            // 绘制数据点连接线条
            drawDataLine(dataLineOptions);
            // 绘制数据多边形填充
            drawDataFill(dataFillOptions);
        }

        /**
         * 绘制数据点连接线条
         * options对象的属性如下：
         * dataPoints: 数据的位置数组
         * strokeStyle: 线条样式
         * lineWidth: 线条宽度
         */
        function drawDataLine(options) {
            let lineColor = options.lineColor ? options.lineColor : "red",
                lineWidth = options.lineWidth ? options.lineWidth : 2,
                dataPointsPosArray = options.dataPoints ? options.dataPoints : [];

            dataPointsPosArrayLen = dataPointsPosArray.length;
            dataPointsPosArrayLen = dataPointsPosArray.length;

            context.save();
            context.beginPath();
            context.translate(userConfig.origin[0], userConfig.origin[1]);
            context.moveTo(dataPointsPosArray[0].x, dataPointsPosArray[0].y);
            for (let i = 1; i < dataPointsPosArrayLen; i++) {
                context.lineTo(dataPointsPosArray[i].x, dataPointsPosArray[i].y);
            }
            context.closePath();
            context.strokeStyle = lineColor;
            context.lineWidth = lineWidth;
            context.lineJoin = "round";
            context.stroke();
            context.restore();
        }


        /**
         * 绘制数据多边形填充
         * options对象的属性如下：
         * dataPoints: 数据的位置数组
         * fillStyle: 填充样式
         */
        function drawDataFill(options) {
            if (options.fillColor === 'transparent') return
            let fillColor = options.fillColor ? options.fillColor : "transparent",
                dataPointsPosArray = options.dataPoints ? options.dataPoints : [];

            dataPointsPosArrayLen = dataPointsPosArray.length;

            context.save();
            context.beginPath();
            context.translate(userConfig.origin[0], userConfig.origin[1]);
            context.moveTo(dataPointsPosArray[0].x, dataPointsPosArray[0].y);
            for (let i = 1; i < dataPointsPosArrayLen; i++) {
                context.lineTo(dataPointsPosArray[i].x, dataPointsPosArray[i].y);
            }
            context.closePath();
            context.fillStyle = fillColor;
            context.fill();
            context.restore();
        }

        /**
         * 绘制数据点圆圈
         * 参数options对象的属性如下：
         * dataPoints: 数据的位置数组
         * r: 圆圈半径
         * strokeStyle: 圆的描边样式
         * fillStyle: 圆的描边宽度
         * lineWidth: 圆的填充样式
         */
        function drawDataCircle(options) {
            if (options.r === 0) return
            let r = options.r ? options.r * ratio : 1 * ratio,
                // strokeStyle = options.strokeStyle ? options.strokeStyle : "#000",
                // lineWidth = options.lineWidth ? options.lineWidth * ratio : 1 * ratio,
                fillColor = options.fillColor ? options.fillColor : "#222",
                dataPointsPosArray = options.dataPoints ? options.dataPoints : [];

            dataPointsPosArrayLen = dataPointsPosArray.length;

            for (let i = 0; i < dataPointsPosArrayLen; i++) {
                drawCircle({
                    x: dataPointsPosArray[i].x,
                    y: dataPointsPosArray[i].y,
                    r: r,
                    originX: userConfig.origin[0],
                    originY: userConfig.origin[1],
                    // strokeStyle: strokeStyle,
                    // lineWidth: lineWidth,
                    fillStyle: fillColor
                });
            }
        }

        /**
         * 绘制圆圈
         * x: 圆心位置x
         * y: 圆心位置y
         * r: 半径
         * originX: 原点位置x
         * originY: 原点位置y
         * strokeStyle: 描边样式
         * lineWidth: 线条宽度
         * fillStyle: 填充样式
         */
        function drawCircle(options) {
            let x = options.x ? options.x : 0,
                y = options.y ? options.y : 0,
                r = options.r ? options.r : 10,
                originX = options.originX ? options.originX : 0,
                originY = options.originY ? options.originY : 0,
                // strokeStyle = options.strokeStyle ? options.strokeStyle : "#000",
                // lineWidth = options.lineWidth ? options.lineWidth : 2,
                fillStyle = options.fillStyle ? options.fillStyle : "#fff";
            context.save();
            context.beginPath();
            context.translate(originX, originY);
            context.arc(x, y, r, 0, Math.PI * 2);
            context.closePath();
            // context.strokeStyle = strokeStyle;
            // context.lineWidth = lineWidth;
            context.lineJoin = "round";
            context.fillStyle = fillStyle;
            // context.stroke();
            context.fill();
            context.restore();
        }

        /**
         * 检查鼠标是否在当前数据点位置，并显示气泡
         * options对象属性如下：
         * tooltipEle: 气泡元素符号
         * tootipContentArray: 气泡元素的文本内容数组
         * tooltipOffsetX: 气泡框显示的水平偏移量
         * tooltipOffsetX: 气泡框显示的垂直偏移量
         * dataCircleRadius: 数据点元素的半径
         */
        function checkIsDataCircle(options) {
            let tooltipEle = options.tooltipEle ? options.tooltipEle : null,
                tootipContentArray = options.tootipContentArray ? options.tootipContentArray : [],
                tooltipOffsetX = options.tooltipOffsetX ? options.tooltipOffsetX : 0,
                tooltipOffsetY = options.tooltipOffsetY ? options.tooltipOffsetY : 0,
                dataCircleRadius = options.dataCircleRadius ? options.dataCircleRadius : 10;


            let allPointArr = []
            for (let loop of baseConfig.inner) {
                let pointArr = getDataPointsPos(baseConfig.n, userConfig.radius, loop.dataRadius, baseConfig.angleArr)
                allPointArr.push(...pointArr)
            }



            // let dataPointsPosArray = getDataPointsPos(baseConfig.n, userConfig.radius, baseConfig.dataRadius, baseConfig.angleArr);
            let dataPointsPosArrayLen = allPointArr.length;
            if (tooltipEle) {
                let isShowTooltips = false;
                let tooltipsEle = tooltipEle;
                element.addEventListener("mousemove", function (e) {
                    for (let i = 0; i < dataPointsPosArrayLen; i++) {
                        isShowTooltips = false;
                        let distance = 0;
                        if (allPointArr[i]) {
                            distance = Math.pow(e.pageX - elementOffsetLeft - allPointArr[i].x - userConfig.origin[0], 2) + Math.pow(e.pageY - elementOffsetTop - allPointArr[i].y - userConfig.origin[1], 2);
                            if (distance <= Math.pow(dataCircleRadius, 2)) {
                                tooltipsEle.style.left = e.pageX - elementOffsetLeft + tooltipOffsetX + "px";
                                tooltipsEle.style.top = e.pageY - elementOffsetTop + tooltipOffsetY + "px";
                                tooltipsEle.innerHTML = tootipContentArray[i];
                                isShowTooltips = true;
                                break;
                            }
                        }
                        // console.log("distance: " + distance);
                    }
                    // console.log("isShowTooltips: " + isShowTooltips);
                    if (isShowTooltips) {
                        tooltipsEle.style.display = "block";
                    } else {
                        tooltipsEle.style.display = "none";
                    }
                });
            }
        }

        /**
         * 获取正多边形每个点的坐标位置数组（相对于原点）
         * n: 多边形的边数
         * r: 半径
         * origin: 原点位置
         */
        function getPolygonPos(nn, rr, origin) {
            let n = nn ? nn : 5,
                r = rr ? rr : 30;
            let dotsArray = []; // 多边形每一个点的坐标数组，格式如[{x: 1, y: 2}]
            let angle = Math.PI * 2 / n;
            for (i = 0; i < n; i++) {
                let curPos = {};
                curPos.x = r * Math.sin(i * angle) + origin[0];
                curPos.y = -r * Math.cos(i * angle) + origin[1];
                dotsArray.push(curPos);
                // console.log(curPos.x + "; " + curPos.y);
            }
            return dotsArray;
        }

        /**
         * 绘制闭合正多边形
         * 参数options对象包含如下属性：
         * n: 边数
         * r：半径
         * origin：正多边形的中心位置。数组形式[x, y]
         * fillStyle：填充样式
         * strokeStyle：线条样式
         * lineWidth: 线条宽度
         * lineCap：线条终点的绘制方式
         * delta：delta指偏移Y轴负方向的角度。默认是从Y轴负方向开始绘制第一个点。采用Math.PI进制
         */
        function drawPolygon(options) {
            // 对传入参数进行默认值设置
            let n = options.n ? options.n : 5,
                r = options.r ? options.r : 30,
                origin = options.origin ? options.origin : [0, 0],
                fillStyle = options.fillStyle ? options.fillStyle : "transparent",
                strokeStyle = options.strokeStyle ? options.strokeStyle : "#000",
                lineWidth = options.lineWidth ? options.lineWidth * ratio : 1 * ratio,
                lineCap = options.lineCap ? options.lineCap : "butt";
            context.save();
            context.beginPath();
            let angle = Math.PI * 2 / n;
            context.translate(origin[0], origin[1]);
            context.moveTo(0, -r);
            for (i = 0; i < n; i++) {
                context.rotate(angle);
                context.lineTo(0, -r);
            }
            context.closePath();

            if (options.strokeStyle) {
                context.strokeStyle = strokeStyle;
                context.lineWidth = lineWidth;
                context.lineCap = lineCap;
                context.stroke();
            }
            if (options.fillStyle) {
                context.fillStyle = fillStyle;
                context.fill();
            }
            context.restore();
        }

        /**
         * 绘制雷达图的描述文字
         * 参数options对象的属性如下：
         * n: 边数
         * r：半径
         * origin：正多边形的中心位置。数组形式[x, y]
         * limit: 文本左右布局的偏差值
         * fontStyle: 文字样式
         * fontColor: 文字颜色
         */
        function drawText(options) {
            let data = options.data ? options.data : [],
                n = options.n ? options.n : 5,
                r = options.r ? options.r : 30,
                origin = options.origin ? options.origin : [0, 0],
                limit = options.limit ? options.limit : 10,
                fontStyle = options.fontStyle ? options.fontStyle : "",
                fontColor = options.fontColor ? options.fontColor : "#000";

            let getPolygonPosArray = getPolygonPos(n, r, origin);
            context.save();
            context.font = fontStyle;
            context.fillStyle = fontColor;

            for (let i = 0; i < data.length; i++) {
                let curPosX = getPolygonPosArray[i].x,
                    curPosY = getPolygonPosArray[i].y;
                if (Math.abs(getPolygonPosArray[i].x - origin[0]) >= limit) {
                    if (getPolygonPosArray[i].x - origin[0] > 0) {
                        context.textAlign = "left";
                        curPosX += 10;
                    } else if (getPolygonPosArray[i].x - origin[0] < 0) {
                        context.textAlign = "right";
                        curPosX -= 10;
                    }
                } else {
                    context.textAlign = "center";
                }
                if (Math.abs(getPolygonPosArray[i].y - origin[1]) >= r - limit) {
                    if (getPolygonPosArray[i].y - origin[1] < 0) {
                        curPosY -= 10;
                    } else if (getPolygonPosArray[i].y - origin[1] > 0) {
                        curPosY += 20;
                    }
                }
                context.fillText(data[i], curPosX, curPosY);
            }
            context.restore();
        }

        /**
         * 绘制雷达的背景图
         * 参数options对象的属性如下：
         * n: 边数
         * r：半径
         * origin：正多边形的中心位置。数组形式[x, y]
         * oddStrokeStyle: index为奇数的多边形的描边样式
         * oddFillStyle: index为奇数的多边形的描边样式
         * evenStrokeStyle: index为偶数的多边形的描边样式
         * evenFillStyle: index为偶数的多边形的描边样式
         */
        function drawRadarBackground(options) {
            let layer = options.layer ? options.layer : 5,
                n = options.n ? options.n : 5,
                r = options.r ? options.r : 50,
                origin = options.origin ? options.origin : [0, 0],
                evenStrokeStyle = options.evenStrokeStyle ? options.evenStrokeStyle : "#ccc",
                oddStrokeStyle = options.oddStrokeStyle ? options.oddStrokeStyle : "#ccc",
                evenFillStyle = options.evenFillStyle ? options.evenFillStyle : "#eee",
                oddFillStyle = options.oddFillStyle ? options.oddFillStyle : "transparent",
                axisColor = options.axisColor ? options.axisColor : "black";
            let layerRadiusArray = [];
            let layerDis = r / layer;
            for (let i = 0; i < layer; i++) {
                layerRadiusArray[i] = layerDis * (i + 1);
            }
            layerRadiusArray = layerRadiusArray.reverse();
            // console.log("layer: " + layer);
            // console.log("layerDis: " + layerDis);
            // console.log("r: " + r);
            // console.log("layerRadiusArray: " + layerRadiusArray);
            for (let i = 0; i < layer; i++) {
                if (i % 2 != 0) {
                    drawPolygon({
                        n: n,
                        r: layerRadiusArray[i],
                        origin: origin,
                        fillStyle: evenFillStyle,
                        strokeStyle: evenStrokeStyle,
                        lineWidth: 1
                    });
                } else {
                    drawPolygon({
                        n: n,
                        r: layerRadiusArray[i],
                        origin: origin,
                        fillStyle: oddFillStyle,
                        strokeStyle: oddStrokeStyle,
                        lineWidth: 1
                    });
                }
            }

            // 绘制放射性连线
            context.save();
            context.beginPath();
            let polygonOuterPointsPosArr = getPolygonPos(n, r, origin);
            for (let i = 0; i < n; i++) {
                context.moveTo(origin[0], origin[1]);
                context.lineTo(polygonOuterPointsPosArr[i].x, polygonOuterPointsPosArr[i].y);
            }
            context.strokeStyle = axisColor;
            context.lineWidth = 1;
            context.stroke();
            context.restore();
        }
    }
}