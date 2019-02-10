<template>
  <div class="column is-6">
    <div class="card whiteboard-wrapper">
      <canvas class="whiteboard" ref="canvas" height="600" width="800" @mousemove="emitLine"></canvas>
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
  props: ["iDraw"],
  methods: {
    clearBoard() {
      this.$socket.emit("clear");
    },
    drawLine(line) {
      let CTX = this.ctx;
      CTX.beginPath();
      CTX.moveTo(line.prevPos.x, line.prevPos.y);
      CTX.lineTo(line.currPos.x, line.currPos.y);
      CTX.stroke();
    },
    emitLine(e) {
      if (this.draw) {
        let pos = this.getMousePosition(this.$refs.canvas, e);

        if (this.prevPos.x != null && this.prevPos.y != null) {
          this.$socket.emit("paint", { prevPos: this.prevPos, currPos: pos });
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
    getMousePosition(canvas, evt) {
      var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,
        scaleY = canvas.height / rect.height;

      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
      };
    },
    addEvents() {
      window.addEventListener("mousedown", this.enableDrawing);
      window.addEventListener("mouseup", this.disableDrawing);
    },
    removeEvents() {
      window.removeEventListener("mousedown", this.enableDrawing);
      window.removeEventListener("mouseup", this.disableDrawing);
    }
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
    }
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d");
    this.addEvents();
  },
  destroyed() {
    this.removeEvents();
  }
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