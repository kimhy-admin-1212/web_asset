$(function () {
  $.ajaxSetup({
    headers: {
      "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
    },
  });
  increasePageView();
  increaseView();
  const dragImage = $("#drag-image");
  const zoomRange = $("#zoom-range");
  const rotateRange = $("#rotate-range");

  let isDragging = false;
  let startX, startY;
  let initialLeft, initialTop;
  let rotation = 0;
  let scale = 1;
  let isFlipped = false;
  let currentLeft = 0;
  let currentTop = 0;

  dragImage.on("mousedown touchstart", function (e) {
    e.preventDefault();
    isDragging = true;
    startX =
      e.type === "mousedown" ? e.clientX : e.originalEvent.touches[0].pageX;
    startY =
      e.type === "mousedown" ? e.clientY : e.originalEvent.touches[0].pageY;
    const transform = dragImage.css("transform");
    const matrix = transform.match(
      /^matrix\((\d+), (\d+), (\d+), (\d+), (-?\d+), (-?\d+)\)$/
    );
    if (matrix) {
      currentLeft = parseInt(matrix[5]);
      currentTop = parseInt(matrix[6]);
    }
    initialLeft = currentLeft;
    initialTop = currentTop;
  });

  $(document).on("mousemove touchmove", function (e) {
    if (isDragging) {
      let offsetX =
        e.type === "mousemove"
          ? e.clientX - startX
          : e.originalEvent.touches[0].pageX - startX;
      let offsetY =
        e.type === "mousemove"
          ? e.clientY - startY
          : e.originalEvent.touches[0].pageY - startY;
      currentLeft = initialLeft + offsetX;
      currentTop = initialTop + offsetY;

      dragImage.css({
        transform: `translate(${currentLeft}px, ${currentTop}px) rotate(${rotation}deg) scale(${scale}) ${
          isFlipped ? "scaleX(-1)" : "scaleX(1)"
        }`,
      });
    }
  });

  $(document).on("mouseup touchend", function () {
    isDragging = false;
  });

  zoomRange.on("input", function () {
    scale = $(this).val();
    updateImageTransform();
  });

  rotateRange.on("input", function () {
    rotation = $(this).val();
    updateImageTransform();
  });

  function updateImageTransform() {
    const transform = dragImage.css("transform");
    const matrix = transform.match(
      /^matrix\((\d+), (\d+), (\d+), (\d+), (-?\d+), (-?\d+)\)$/
    );
    if (matrix) {
      currentLeft = parseInt(matrix[5]);
      currentTop = parseInt(matrix[6]);
    }

    dragImage.css({
      transform: `translate(${currentLeft}px, ${currentTop}px) rotate(${rotation}deg) scale(${scale}) ${
        isFlipped ? "scaleX(-1)" : "scaleX(1)"
      }`,
    });
  }

  window.loadFile = function (event) {
    var reader = new FileReader();
    reader.onload = function () {
      var output = document.getElementById("drag-image");
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
    grecaptcha.ready(function () {
      grecaptcha
        .execute($("#wrapper-content").data("sk"), {
          action: "submit",
        })
        .then(function (token) {
          let fid = $("#wrapper-content").data("fid");
          $.ajax({
            url: "/frames/" + fid + "/increase-download",
            method: "PATCH",
            data: { captcha: token },
          });
        });
    });
  };

  $("#flip-button").on("click", function () {
    isFlipped = !isFlipped;
    updateImageTransform();
  });

  $(".btn-download-qr-code").on("click", function () {
    downloadQRCode();
  });
});
$(window).on("load", function () {
  setHeightMainImage();
  $(".list-frames").on("click", "li img", function () {
    $(".list-frames li img").removeClass("active");
    $(this).addClass("active");
    var imageUrl = $(this).attr("src");
    $("#main-image").attr("src", imageUrl);
    setHeightMainImage();
  });
});

function setHeightMainImage() {
  var childHeight = $("#main-image").height();
  $("#transparent").css("height", childHeight + "px");
}

function saveAsImage() {
  var transparentDiv = $("#transparent");
  var screenWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  var scaleResponsive = screenWidth > 540 ? 2 : 3.6;

  html2canvas(transparentDiv.get(0), {
    scrollX: 500,
    scale: scaleResponsive,
    width: 420.5,
    height: 420.5,
  }).then(function (canvas) {
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "frame_image.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }, "image/png");
  });
}

function copyContent(obj) {
  if (typeof navigator.clipboard !== "undefined") {
    navigator.clipboard.writeText($(obj).find("input")[0].value);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Sao chép thành công!",
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

function downloadQRCode() {
  var qrCodeImage = document.getElementById("qrCodeImage");
  var downloadLink = document.createElement("a");
  downloadLink.href = qrCodeImage.src;
  downloadLink.download = "qrcode.png";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function showQrCode() {
  var currentUrl = window.location.href;
  var imgElement = document.getElementById("qrCodeImage");
  $("#qr-code").attr("title", currentUrl);
  QRCode.toDataURL(
    currentUrl,
    { width: 2000, height: 2000 },
    function (err, url) {
      if (err) {
        console.error(err);
        return;
      }
      imgElement.src = url;
    }
  );
}

function increaseView() {
  let fid = $("#wrapper-content").data("fid");
  $.ajax({
    url: "/frames/" + fid + "/increase-view",
    method: "PATCH",
  });
}

function increasePageView() {
  $.ajax({
    url: "/increase-view",
    method: "POST",
  });
}

showQrCode();
