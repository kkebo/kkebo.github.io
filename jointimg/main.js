(function() {
	"use strict";

	var pcanvas;
	var pctx;
	var canvas;
	var ctx;
	var xsize;
	var ysize;

	document.addEventListener('DOMContentLoaded', function() {
		// Get elements
		pcanvas = document.getElementById('preview');
		pctx = pcanvas.getContext('2d');
		canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
		xsize = document.getElementById('xsize');
		ysize = document.getElementById('ysize');

		// Initialize elements
		pcanvas.width = window.innerWidth * window.devicePixelRatio;
		pcanvas.height = window.innerHeight * window.devicePixelRatio;
		xsize.value = 1024;
		ysize.value = 768;
		var hasSupport = function(mime) {
			var canvas = document.createElement('canvas');
			canvas.width = canvas.height = 1;
			var uri = canvas.toDataURL(mime);
			return uri.match(mime) !== null;
		};
		['image/jpeg', 'image/gif', 'image/bmp', 'image/tiff', 'image/x-icon', 'image/svg+xml', 'image/webp'].forEach(function(mime) {
			if (hasSupport(mime)) {
				var option = document.createElement('option');
				option.textContent = mime;
				document.getElementById('fileType').appendChild(option);
			}
		});

		// Initialize events
		document.getElementById('filePicker').addEventListener('change', preview);
		xsize.addEventListener('change', preview);
		ysize.addEventListener('change', preview);
		document.getElementById('saveButton').addEventListener('click', save);

		document.getElementById('editButton').addEventListener('click', function(e) {
			document.getElementById('controlPanel').classList.toggle('hidden');
			document.getElementById('buttonPanel').classList.toggle('hidden');
		});

		var hideControlPanel = function(e) {
			document.getElementById('controlPanel').classList.add('hidden');
			document.getElementById('buttonPanel').classList.remove('hidden');
		};
		pcanvas.addEventListener('click', hideControlPanel);
		document.getElementById('doneButton').addEventListener('click', hideControlPanel);
	});

	function preview() {
		var file = document.getElementById('filePicker').files[0];
		if (!/^image\/(png|jpeg)$/.test(file.type)) return;

		if (alertIfNeeded()) return;

		var reader = new FileReader();
		reader.addEventListener('load', function() {
			canvas.width = parseInt(xsize.value);
			canvas.height = parseInt(ysize.value);
			var img = new Image();
			img.src = reader.result;
			img.addEventListener('load', function() {
				// 元画像のサイズを表示
				document.getElementById('sourceX').textContent = img.width;
				document.getElementById('sourceY').textContent = img.height;

				ctx.clearRect(0, 0, canvas.width, canvas.height);
				for (var y = 0; y < canvas.height / img.height; y++) {
					for (var x = 0; x < canvas.width / img.width; x++) {
						ctx.drawImage(img, x * img.width, y * img.height);
					}
				}
				var preview = new Image();
				preview.src = canvas.toDataURL();
				preview.addEventListener('load', function() {
					pctx.clearRect(0, 0, pcanvas.width, pcanvas.height);
					var w = preview.width;
					var h = preview.height;
					if (w > pcanvas.width || h > pcanvas.height) {
						if (h / w > pcanvas.height / pcanvas.width) {
							w = pcanvas.height * w / h;
							h = pcanvas.height;
						} else {
							h = pcanvas.width * h / w;
							w = pcanvas.width;
						}
					}
					pctx.drawImage(preview, (pcanvas.width - w) / 2, (pcanvas.height - h) / 2, w, h);

					// タイトル画面を消す
					Array.prototype.forEach.call(document.querySelectorAll('.fullScreen:not(.preview)'), function(element) {
						//element.style.display = 'none';
						element.style.width = '200px';
						element.style.height = '100px';
					});

					// Done ボタンを押せるようにする
					document.getElementById('doneButton').disabled = false;
				});
			});
		});
		reader.readAsDataURL(file);
	}

	function alertIfNeeded() {
		if (parseInt(xsize.value) >= 10000 || parseInt(ysize.value) >= 10000) {
			return !confirm('生成後の画像のサイズが非常に大きいため、負荷がかかります。本当に続けますか？');
		}
	}

	function save() {
		window.open(canvas.toDataURL(document.getElementById('fileType').value));
	}
})();
