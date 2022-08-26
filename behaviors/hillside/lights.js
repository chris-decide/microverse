class LightPawn {
    setup() {
        console.log("LightPawn");
        let trm = this.service("ThreeRenderManager");
        let scene =  trm.scene;
        let camera = trm.camera;
        let group = this.shape;

        this.removeLights();

        let ambient = new Microverse.THREE.AmbientLight( 0xffffff, .5 );
        group.add(ambient);
        this.lights.push(ambient);

        // let dir = new Microverse.THREE.Vector3(-2, -0.15, -0);
        let directional = new Microverse.THREE.DirectionalLight( 0xffffff, .5);
        directional.position.set(-10, 200, 10);
        this.lights.push(directional);
        group.add(directional);

        this.constructBackground(this.actor._cardData);

        // let moduleName = this._behavior.module.externalName;
        this.listen("updateShape", "updateShape");
    }

    removeLights() {
        if (this.lights) {
            this.lights.forEach((light) => {
                this.shape.remove(light);
            });
        }
        this.lights = [];
    }

    teardown() {
        console.log("teardown lights");
        if(this.background)this.background.dispose();
        this.removeLights();
    }

    updateShape(options) {
        this.constructBackground(options);
    }

    constructBackground(options) {
        console.log('lights', options)
        let assetManager = this.service("AssetManager").assetManager;
        let dataType = options.dataType;
        let TRM = this.service("ThreeRenderManager");
        let renderer = TRM.renderer;
        let scene = TRM.scene;
        if (options.dataLocation)
            return this.getBuffer(options.dataLocation).then((buffer) => {
                return assetManager.load(buffer, dataType, Microverse.THREE, options).then((texture) => {

                    let pmremGenerator = new Microverse.THREE.PMREMGenerator(renderer);
                    pmremGenerator.compileEquirectangularShader();

                    let exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
                    let exrBackground = exrCubeRenderTarget.texture;

                    let bg = scene.background;
                    let e = scene.environment;
                    scene.background = exrBackground;
                    scene.environment = exrBackground;
                    if(e !== bg) if(bg) bg.dispose();
                    if(e) e.dispose();
                    texture.dispose();
                });
            });
        else if(options.clearColor)renderer.setClearColor(options.clearColor);
    }
}

export default {
    modules: [
        {
            name: "Lights",
            pawnBehaviors: [LightPawn]
        }
    ]
}

/* globals Microverse */