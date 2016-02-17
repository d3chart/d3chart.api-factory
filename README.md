# d3chart.api-factory

[CN] d3chart 图表 API 接口生成器；


## 通用 API 说明 <small>（使用者）</small>

### .init(element)

> 图表初始化的入口，如果在实例化时已有正常的 DOM 入参，则在实例化时就会初始化；
> 只能初始化一次；

### .setOptions(options)

> 更新 options 配置，结构如：

```js
var options = {
    animation: false,
    chart: {
        itemStyle: {
            normal: {
                color: '#666'
            }
        }
    }
};
```

> 当更新某些配置时，还需要手动触发图表的重绘，比如：

```js
barApi.setOptions(options).render();
```
*当然，也可以通过配置 options.autoRender=true 来实现自动重绘；*

### .setData(data, notClean)

> 更新数据；具体图表需要的数据结构，请参考其说明页；

### .render()

> 绘制/重绘图表，会连同 options 及 data 一起作用重绘图表；应用场景如：

```js
barApi.setOptions(options)
    .render();
// 又比如
barApi.setData(data)
    .render();
// 再比如
barApi.setOptions(options)
    .setData(data)
    .render();
```

> 当然，也不是必须要每次手动触发 render；可以通过配置 options.autoRender=true 来实现自动触发绘制；但是出于性能提升考虑，上例的第三个手动只触发一次 render，但是自动可能会触发两次 render；

### .resize()

> 该表图表的大小；应用场景如：@element 大小变化时，需要实时调整图表的大小；我们建议在触发图表 resize 时采用延迟策略，避免不必要的重绘，如：

```js
// 定时器
var timer = null;
window.onresize = function () {
    timer && clearTimeout(timer);

    timer = setTimeout(function () {
        // TODO 调整 @element 的大小，如果需要的话

        barApi.resize();
    }, 100);
};
```

### .destroy()

> 销毁图表，包括：文档中的 DOM、对内存的占用、图表实例；

> 如果异步队列中还存在未执行完的更新操作，会等待队列结束后再销毁；
