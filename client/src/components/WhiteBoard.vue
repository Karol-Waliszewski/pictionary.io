<template>
  <div class="column is-6">
    <div class="card whiteboard-wrapper">
      <canvas
        v-if="iDraw"
        class="whiteboard"
        ref="canvas"
        height="600"
        width="800"
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
      ></canvas>
      <footer class="card-footer whiteboard-footer" v-if="iDraw">
        <button class="button" @click="clearBoard">Clear</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "Whiteboard",
  data() {
    return { prevPos: { x: null, y: null }, ctx: null, draw: false };
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
      CTX.beginPath();
      CTX.moveTo(line.prevPos.x, line.prevPos.y);
      CTX.lineTo(line.currPos.x, line.currPos.y);
      CTX.closePath();
      CTX.stroke();
    },
    emitLine(e) {
      if (this.draw && this.iDraw) {
        let pos = this.getCanvasPosition(this.$refs.canvas, e);

        if (this.prevPos.x != null && this.prevPos.y != null && this.started) {
          let coords = { prevPos: this.prevPos, currPos: pos };
          this.$socket.emit("paint", coords);
          this.drawLine(coords);
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
  max-height: 100%;
  flex: 1;
  // background: palegoldenrod;
}

.whiteboard-footer {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
</style>
