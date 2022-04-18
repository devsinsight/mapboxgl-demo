import { Component, OnInit } from "@angular/core";
import * as mapboxgl from "mapbox-gl";
import * as MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "mapbox-markers-sample";

  map: mapboxgl.Map;
  constructor() {}

  ngOnInit(): void {
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.5, 40],
      zoom: 9,
    });

    const draw = new MapboxDraw({
      boxSelect: true,
    });

    var center = [-74.5, 40];
    var radius = 20;
    var options = { steps: 50, Units: "kilometers", properties: {} };
    var circle = turf.circle(center, radius, options);

    this.map.addControl(draw, "top-right");
    //map.addControl(new mapboxgl.NavigationControl());

    const el = document.createElement("i");
    el.className = "custom-icon blue";

    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
      "Hello World"
    );

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([-74.5, 40])
      .setPopup(popup)
      .addTo(this.map);

    //const listOfMarkers = turf.points([marker.getLngLat().toArray()]);
    const listOfMarkers: mapboxgl.Marker[] = [];
    listOfMarkers.push(marker);

    const updateSelection = (data) => {
      if (!data) return;

      const polygons = data.features.filter(
        (f) => f.geometry.type === "Polygon"
      );

      polygons.forEach((polygon) => {
        let p = turf.polygon(polygon.geometry["coordinates"]);
        let markersLngLat = turf.points(
          listOfMarkers.map((p) => p.getLngLat().toArray())
        );
        let points = turf.pointsWithinPolygon(markersLngLat, p);

        listOfMarkers.forEach((m) => {
          let exists =
            !!points.features.find((p) =>
              p.geometry.coordinates.every(
                (val, index) => val === m.getLngLat().toArray()[index]
              )
            ) && data.type !== "draw.delete";

          let elem = m.getElement();

          if (exists) {
            elem.classList.remove("blue");
            elem.classList.add("green");
          } else {
            elem.classList.remove("green");
            elem.classList.add("blue");
          }
        });
      });
    };

    this.map.on("draw.create", updateSelection);
    this.map.on("draw.delete", updateSelection);
    this.map.on("draw.update", updateSelection);

    this.map.on("load", () => {
      this.map.addSource("circle", {
        type: "geojson",
        data: circle,
      });

      this.map.addLayer({
        id: "custom-layer",
        type: "line",
        source: "circle",
      });

    });
  }

  refresh() {
    this.map.setCenter( [-74.5, 40])
  }
}
