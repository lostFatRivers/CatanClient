let BaseScrollView = cc.Class({
    extends: cc.Component,

    properties: {
        itemScrollView: {
            default: null,
            type: cc.ScrollView,
            tooltip: "ScrollView节点"
        },
        itemPrefab: {
            default: null,
            type: cc.Prefab,
            tooltip: "ScrollView中元素的预制体"
        },
        updateInterval: {
            default: 0.2,
            tooltip: "列表刷新间隔"
        },

        itemHeight: {
            default: 60,
            tooltip: "元素的高度"
        },
        spacing: {
            default: 10,
            tooltip: "元素间隔"
        },
        itemPoolSize: {
            default: 10,
            tooltip: "用于循环的元素个数"
        },

        // 元素列表
        _itemList: [],
        // 元素脚本名称
        _itemComponentName: "",
        // 数据列表
        _dataList: null,
        // 判断超出距离, 距中心点;
        _outViewLength: 0,
        // 更新时间
        _updateTimer: 0,
        // 上一次content的位置
        _lastPosition: 0,
    },

    /**
     * 初始化;
     *
     * @param dataList 需要显示的数据列表;
     * @param itemComponentName item的脚本组件名称, 用于更新组件中的data;
     */
    init: function(dataList, itemComponentName) {
        this.itemScrollView.scrollToTop();
        this._dataList = dataList;
        this._itemComponentName = itemComponentName;
        this._lastPosition = this.itemScrollView.content.y;
        this.itemScrollView.content.height = (this.itemHeight + this.spacing) * dataList.length - this.spacing;
        this._outViewLength = this.itemScrollView.node.height + this.itemHeight;
    },

    showView: function() {
        for (let i = 0; i < this.itemPoolSize; i++) {
            let startTime = new Date().getTime();
            let tItem = this._itemList[i];
            if (tItem) {
                let itemData = this._dataList[tItem.itemId];
                tItem.getComponent(this._itemComponentName).host = this;
                tItem.getComponent(this._itemComponentName).setData(itemData);
                return;
            }
            tItem = cc.instantiate(this.itemPrefab);
            tItem.y = 0 - (tItem.height / 2 + i * (tItem.height + this.spacing));
            let itemData = this._dataList[i];
            if (itemData === null || itemData === undefined) {
                continue;
            }
            tItem.itemId = i;
            tItem.getComponent(this._itemComponentName).host = this;
            tItem.getComponent(this._itemComponentName).setData(itemData);
            this._itemList.push(tItem);
            this.itemScrollView.content.addChild(tItem);
        }
    },

    clearView: function() {
        for (let i = 0; i < this._itemList.length; i++) {
            let tItem = this._itemList[i];
            if (tItem) {
                tItem.destroy();
            }
        }
        this._itemList = [];
    },

    updateScroll: function() {
        let dis = this.itemScrollView.content.y - this._lastPosition;
        for (let i = 0; i < this._itemList.length; i++) {
            if (dis > 0) {
                // 往上滑
                this.checkThenMoveToLast(this._itemList[i]);
            } else if (dis < 0) {
                // 往下滑
                this.checkThenMoveToFirst(this._itemList[i]);
            }
        }
        this._lastPosition = this.itemScrollView.content.y;
    },

    /**
     * 检测出屏则移到队尾;
     */
    checkThenMoveToLast: function(item) {
        this.itemCheckThenMoveBySymbol(item, 1);
    },

    /**
     * 检测出屏则移到队首;
     */
    checkThenMoveToFirst: function(item) {
        this.itemCheckThenMoveBySymbol(item, -1);
    },

    /**
     * 根据符号判断将元素移到队首还是队尾;<br/>
     * symbol: 1 队首, -1 队尾;
     */
    itemCheckThenMoveBySymbol: function(item, symbol) {
        let worldPos = this.itemScrollView.content.convertToWorldSpaceAR(item.position);
        let viewPos = this.itemScrollView.node.convertToNodeSpaceAR(worldPos);
        if ((symbol === 1 && viewPos.y < this.itemHeight * 2)
            || (symbol === -1 && viewPos.y > -this._outViewLength)) {
            return;
        }
        let newItemId = item.itemId + symbol * this.itemPoolSize;
        if (!this._dataList) {
            return;
        }
        let itemData = this._dataList[newItemId];
        if (itemData === undefined || itemData == null) {
            return;
        }
        item.y = item.y - symbol * (item.height + this.spacing) * this.itemPoolSize;
        item.itemId = newItemId;
        item.getComponent(this._itemComponentName).host = this;
        item.getComponent(this._itemComponentName).setData(itemData);
    },

    beforeUpdate: function() {
        // override me
    },

    update(dt) {
        this.beforeUpdate(dt);
        this._updateTimer += dt;
        if (this._updateTimer < this.updateInterval) return;
        this._updateTimer = 0;

        this.updateScroll();
    }

});