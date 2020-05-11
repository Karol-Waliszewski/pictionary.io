<template>
  <div class="column is-6">
    <div class="card whiteboard-wrapper">
      <canvas
        v-if="iDraw"
        class="whiteboard"
        ref="canvas"
        height="600"
        width="800"
        :draggable="false"
        @mousemove="emitLine"
        @touchmove="getTouchPosition"
        @mouseleave="leaveCanvas"
      ></canvas>
      <canvas
        v-else
        class="whiteboard"
        ref="canvas"
        height="600"
        width="800"
        :draggable="false"
      ></canvas>
      <footer class="card whiteboard-footer" v-if="iDraw">
        <div class="card-content">
          <div class="columns is-multiline is-mobile">
            <div class="column" v-for="color in colors" :key="color">
              <div
                class="color"
                :class="{ active: activeColor == color }"
                :style="{ background: `${color}` }"
                @click="activeColor = color"
              ></div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <a href="#" class="card-footer-item" @click.prevent="clearBoard"
            >Clear the board</a
          >
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "Whiteboard",
  data() {
    return {
      colors: [
        "#000",
        "#654321",
        "#95a5a6",
        "#f1c40f",
        "#f39c12",
        "#c0392b",
        "#3498db",
        "#2ecc71",
      ],
      activeColor: "#000",
      prevPos: { x: null, y: null },
      ctx: null,
      draw: false,
    };
  },
  props: ["iDraw", "started"],
  methods: {
    initBoard() {
      this.ctx = this.$refs.canvas.getContext("2d");
      this.ctx.lineJoin = "round";
    },
    clearBoard() {
      this.$socket.emit("clear");
    },
    drawLine(line) {
      let CTX = this.ctx;
      let { color, coords } = line;
      if (coords) {
        CTX.strokeStyle = color;
        CTX.beginPath();
        CTX.moveTo(coords.prevPos.x, coords.prevPos.y);
        CTX.lineTo(coords.currPos.x, coords.currPos.y);
        CTX.closePath();
        CTX.stroke();
      }
    },
    emitLine(e) {
      if (this.draw && this.iDraw) {
        let pos = this.getCanvasPosition(this.$refs.canvas, e);

        if (this.prevPos.x != null && this.prevPos.y != null && this.started) {
          let coords = { prevPos: this.prevPos, currPos: pos };
          let paintObj = { color: this.activeColor, coords };
          this.$socket.emit("paint", paintObj);
          this.drawLine(paintObj);
        }
        // New previous pos
        this.prevPos.x = pos.x;
        this.prevPos.y = pos.y;
      }
    },
    enableDrawing() {
      this.draw = true;
    },
    disableDrawing() {
      this.draw = false;
      this.prevPos.x = null;
      this.prevPos.y = null;
    },
    leaveCanvas() {
      this.prevPos.x = null;
      this.prevPos.y = null;
    },
    getTouchPosition(e) {
      if (this.iDraw) {
        e.preventDefault();
        e.stopPropagation();
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        this.emitLine(mouseEvent);
      }
    },
    getCanvasPosition(canvas, evt) {
      var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,
        scaleY = canvas.height / rect.height;

      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY,
      };
    },
    addEvents() {
      window.addEventListener("mousedown", this.enableDrawing);
      window.addEventListener("touchstart", this.enableDrawing);
      window.addEventListener("mouseup", this.disableDrawing);
      window.addEventListener("touchend", this.disableDrawing);
    },
    removeEvents() {
      window.removeEventListener("mousedown", this.enableDrawing);
      window.removeEventListener("touchstart", this.enableDrawing);
      window.removeEventListener("mouseup", this.disableDrawing);
      window.removeEventListener("touchend", this.disableDrawing);
    },
  },
  watch: {
    iDraw(value) {
      if (value) {
        this.addEvents();
      } else {
        this.removeEvents();
      }
    },
  },
  sockets: {
    paint(coords) {
      if (coords) {
        this.drawLine(coords);
      }
    },
    getPainting(lines) {
      for (let line of lines) {
        this.drawLine(line);
      }
    },
    clear() {
      this.ctx.clearRect(
        0,
        0,
        this.$refs.canvas.width,
        this.$refs.canvas.height
      );
    },
  },
  mounted() {
    this.initBoard();
    if (this.iDraw) {
      this.addEvents();
    }
  },
  destroyed() {
    this.removeEvents();
  },
};
</script>
<style lang="scss">
.whiteboard-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.whiteboard {
  width: 100%;
  height: 100%;
  flex: 1;
  // background: palegoldenrod;
  @media screen and (min-width: 768px) {
    min-height: 590px;
  }
}

.whiteboard-footer {
  /* display: flex;
  flex-direction: column;
  padding: 1rem; */
}

.color {
  padding-bottom: 100%;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid lightgray;
  &.active {
    border: 1px solid #000;
  }
}
</style>
