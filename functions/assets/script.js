//review widget
var el = document.getElementById("hello-world");

var root = el ? el : document.createElement("iframe");

root.width = "100%";
root.style.minHeight = "300px";
root.style.border = "none";
root.id = "hello-world";
root.src = `https://us-central1-pohoda-sandbox-dev.cloudfunctions.net/appv2/assets/hello-world.html`;

document.getElementsByTagName("main")[0].appendChild(root);




