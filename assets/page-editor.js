// === CNCDP - Initialisation editeur GrapesJS ===
document.addEventListener("DOMContentLoaded", function() {
    var overlay = document.getElementById("editor-overlay");
    var htmlInput = document.getElementById("html-content");
    var grapesjsDataInput = document.getElementById("grapesjs-data");
    var editorInstance = null;
    var editorIntervals = []; // Intervalles de l'éditeur (B6) — suspendus quand l'overlay est fermé
    function addInterval(fn, ms) {
        // Wrapper : ne s'exécute que si l'éditeur est visible (évite le travail inutile en arrière-plan)
        var id = setInterval(function() {
            if (overlay && overlay.style.display !== "none") fn();
        }, ms);
        editorIntervals.push(id);
        return id;
    }
    function clearEditorIntervals() { editorIntervals.forEach(clearInterval); editorIntervals = []; }
    var titleInput = document.getElementById("page-title");
    var slugInput = document.getElementById("page-slug");
    var slugAuto = true;
    if (titleInput && slugInput) {
        titleInput.addEventListener("input", function() { if (slugAuto) slugInput.value = titleInput.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); });
        slugInput.addEventListener("input", function() { slugAuto = false; });
    }
    function initEditor() {
        var initialData = {};
        try { initialData = JSON.parse(grapesjsDataInput.value || "{}"); } catch(e) {}
        editorInstance = grapesjs.init({
            container: "#gjs", fromElement: false, width: "auto",
            storageManager: { type: "indexeddb", autosave: false },
            i18n: {
                locale: "fr", detectLocale: false,
                messages: { fr: { styleManager: { empty: "Sélectionnez un élément pour le styliser", layer: "Calque", fileButton: "Images", sectors: { general: "Général", layout: "Mise en page", typography: "Typographie", decorations: "Décorations", extra: "Extra", flex: "Flexbox", dimension: "Dimensions" } }, traitManager: { empty: "Sélectionnez un élément pour voir ses propriétés", label: "Paramètres", traits: { labels: {}, options: {} } }, blockManager: { labels: {}, categories: {} }, domComponents: { names: { header: "Titre", text: "Texte", image: "Image", link: "Lien", button: "Bouton", section: "Section", container: "Conteneur", row: "Ligne", column: "Colonne", card: "Carte", video: "Vidéo", list: "Liste", map: "Carte", default: "Bloc" } }, deviceManager: { device: "Appareil", devices: { desktop: "Ordinateur", tablet: "Tablette", mobile: "Mobile" } }, panels: { buttons: { titles: { preview: "Aperçu", fullscreen: "Plein écran", "sw-visibility": "Voir les contours", "export-template": "Voir le code", "open-sm": "Gestionnaire de styles", "open-tm": "Paramètres", "open-layers": "Calques", "open-blocks": "Blocs" } } }, selectorManager: { label: "Classes CSS", selected: "Sélectionné", emptyState: "- État -", states: { hover: "Survol", active: "Actif", "nth-of-type(2n)": "Pair/Impair" } }, modal: { import: { title: "Importer", button: "Importer", label: "" } }, assetManager: { addButton: "Ajouter une image", inputPlh: "URL de l'image…", modalTitle: "Sélectionner une image", uploadTitle: "Déposer des fichiers ici ou cliquer pour uploader" } } }
            },
            plugins: ["gjs-blocks-basic","grapesjs-preset-webpage","grapesjs-blocks-bootstrap4","grapesjs-indexeddb","grapesjs-plugin-forms","grapesjs-tui-image-editor","grapesjs-blocks-flexbox"],
            pluginsOpts: { "gjs-blocks-basic":{}, "grapesjs-preset-webpage":{}, "grapesjs-blocks-bootstrap4":{}, "grapesjs-indexeddb":{ options:{ key:"gjsProject-" + (document.getElementById("gjs")?.dataset?.pageId || "new"), dbName:"gjs", objectStoreName:"projects" } }, "grapesjs-plugin-forms":{}, "grapesjs-tui-image-editor":{ config:{ includeUI:{ initMenu:"filter" } }, labelImageEditor:"Éditeur d'image", labelApply:"Appliquer", height:"650px", width:"100%", script:["https://uicdn.toast.com/tui.code-snippet/v1.5.2/tui-code-snippet.min.js","https://uicdn.toast.com/tui-color-picker/v2.2.7/tui-color-picker.min.js","https://uicdn.toast.com/tui-image-editor/v3.15.3/tui-image-editor.min.js"], style:["https://uicdn.toast.com/tui-color-picker/v2.2.7/tui-color-picker.css","https://uicdn.toast.com/tui-image-editor/v3.15.3/tui-image-editor.css"] }, "grapesjs-blocks-flexbox":{} },
            selectorManager: {
                componentFirst: true,  // Style cible l'ID du composant, pas la classe partagée
            },
            styleManager: {
                sectors: [
                    {
                        name: "Général", open: true,
                        properties: [
                            { name: "Couleur de fond", property: "background-color", type: "color", defaults: "" },
                            { name: "Style de fond", property: "background-image", type: "select", defaults: "none",
                                options: [
                                    {value:"none",name:"🎨 Couleur unie"},
                                    {value:"linear-gradient(135deg, var(--grad-start, #9d38da), var(--grad-end, #9335e4))",name:"↗ Dégradé diagonal"},
                                    {value:"linear-gradient(to right, var(--grad-start, #9d38da), var(--grad-end, #9335e4))",name:"→ Dégradé horizontal"},
                                    {value:"linear-gradient(to bottom, var(--grad-start, #9d38da), var(--grad-end, #9335e4))",name:"↓ Dégradé vertical"},
                                    {value:"linear-gradient(135deg, var(--grad-start, #2d2540), var(--grad-end, #443a58))",name:"🌙 Dégradé sombre"},
                                    {value:"linear-gradient(135deg, var(--grad-start, #fd82bb), var(--grad-end, #e05590))",name:"🌸 Dégradé rose"},
                                    {value:"linear-gradient(135deg, var(--grad-start, #de6d11), var(--grad-end, #fcbc63))",name:"🍊 Dégradé orange"}
                                ]
                            },
                            { name: "Couleur début dégradé", property: "--grad-start", type: "color", defaults: "#9d38da" },
                            { name: "Couleur fin dégradé", property: "--grad-end", type: "color", defaults: "#9335e4" },
                            { name: "Couleur du texte", property: "color", type: "color", defaults: "" }
                        ]
                    },
                    {
                        name: "Typographie", open: false,
                        properties: [
                            { name: "Taille du texte", property: "font-size", type: "select", defaults: "1rem",
                                options: [{value:"0.75rem",name:"Très petit"},{value:"0.875rem",name:"Petit"},{value:"1rem",name:"Normal"},{value:"1.25rem",name:"Grand"},{value:"1.5rem",name:"Très grand"},{value:"2rem",name:"Titre"},{value:"2.5rem",name:"Énorme"}] },
                            { name: "Graisse", property: "font-weight", type: "radio", defaults: "400",
                                options: [{value:"400",name:"Normal"},{value:"700",name:"Gras"}] },
                            { name: "Alignement", property: "text-align", type: "radio", defaults: "left",
                                options: [{value:"left",name:"Gauche"},{value:"center",name:"Centre"},{value:"right",name:"Droite"}] },
                            { name: "Interligne", property: "line-height", type: "select", defaults: "",
                                options: [{value:"",name:"— Défaut —"},{value:"1.2",name:"Serré"},{value:"1.5",name:"Normal"},{value:"1.8",name:"Aéré"},{value:"2.2",name:"Très aéré"}] }
                        ]
                    },
                    {
                        name: "Espacement", open: false,
                        properties: [
                            { name: "Marge intérieure", property: "padding", type: "integer", units: ["px"], defaults: "0", min: 0, max: 200 },
                            { name: "Marge extérieure", property: "margin", type: "integer", units: ["px"], defaults: "0", min: 0, max: 200 }
                        ]
                    },
                    {
                        name: "Bordure & Arrondi", open: false,
                        properties: [
                            { name: "Couleur", property: "border-color", type: "color", defaults: "" },
                            { name: "Couleur bordure sup.", property: "border-top-color", type: "color", defaults: "" },
                            { name: "Épaisseur", property: "border-width", type: "select", defaults: "",
                                options: [
                                    {value:"",name:"— Défaut —"},
                                    {value:"0",name:"Aucune"},
                                    {value:"1px",name:"1px (fine)"},
                                    {value:"2px",name:"2px (normale)"},
                                    {value:"3px",name:"3px (moyenne)"},
                                    {value:"4px",name:"4px (épaisse)"},
                                    {value:"6px",name:"6px (très épaisse)"},
                                    {value:"8px",name:"8px (extra épaisse)"}
                                ]
                            },
                            { name: "Style du trait", property: "border-style", type: "select", defaults: "",
                                options: [
                                    {value:"",name:"— Défaut —"},
                                    {value:"solid",name:"━ Continu"},
                                    {value:"dashed",name:"┅ Tirets"},
                                    {value:"dotted",name:"· Pointillé"},
                                    {value:"double",name:"═ Double"},
                                    {value:"none",name:"✕ Aucune"}
                                ]
                            },
                            { name: "Coins arrondis", property: "border-radius", type: "select", defaults: "0",
                                options: [
                                    {value:"0",name:"▣ Carrés"},
                                    {value:"0.25rem",name:"◈ Légers"},
                                    {value:"0.5rem",name:"◉ Arrondis"},
                                    {value:"1rem",name:"⬤ Très arrondis"},
                                    {value:"50%",name:"● Cercle"}
                                ]
                            }
                        ]
                    },
                    {
                        name: "Effets", open: false,
                        properties: [
                            { name: "Ombre", property: "box-shadow", type: "select", defaults: "",
                                options: [
                                    {value:"",name:"— Aucune —"},
                                    {value:"0 1px 3px rgba(0,0,0,0.1)",name:"Légère"},
                                    {value:"0 4px 6px -1px rgba(0,0,0,0.12)",name:"Moyenne"},
                                    {value:"0 10px 25px -5px rgba(0,0,0,0.2)",name:"Forte"},
                                    {value:"0 20px 40px -10px rgba(0,0,0,0.3)",name:"Très forte"}
                                ]
                            },
                            { name: "Transparence", property: "opacity", type: "select", defaults: "1",
                                options: [
                                    {value:"1",name:"Opaque (normal)"},
                                    {value:"0.85",name:"Légèrement transparent"},
                                    {value:"0.6",name:"Semi-transparent"},
                                    {value:"0.35",name:"Très transparent"}
                                ]
                            }
                        ]
                    },
                    {
                        name: "Taille", open: false,
                        properties: [
                            { name: "Largeur", property: "width", type: "integer", units: ["px","%"], defaults: "auto", min: 0 },
                            { name: "Hauteur", property: "height", type: "integer", units: ["px","%"], defaults: "auto", min: 0 }
                        ]
                    }
                ]
            },
            canvas: { styles: ["https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css", "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap", document.getElementById("gjs")?.dataset?.cncdpCss || "", "data:text/css;charset=utf-8," + encodeURIComponent(":root{--grad-start:#9d38da;--grad-end:#9335e4;} .gjs-dashed [data-gjs-highlightable] { outline: 2px dashed #000000 !important; } .gjs-dashed .gjs-selected { outline: 3px solid #2563eb !important; } body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:#212529;} .text-secondary{color:#6b647a;}")], scripts: ["https://code.jquery.com/jquery-3.6.4.slim.min.js", "https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"], badge: true },
            projectData: initialData,
            // Configuration du Rich Text Editor (barre de mise en forme)
            richTextEditor: {
                // Forcer l'activation du RTE sur les composants texte
                onDoubleClick: true,
            },
        });
        editorInstance.on("load", function() {
            // Si le projet GrapesJS est vide mais qu'il y a du contenu HTML existant, le charger
            if (editorInstance.getWrapper().components().length === 0 && htmlInput && htmlInput.value.trim()) {
                editorInstance.setComponents(htmlInput.value.trim());
            }

            var panelMap = { "tb-blocks":{panel:"views",btn:"open-blocks"}, "tb-layers":{panel:"views",btn:"open-layers"}, "tb-styles":{panel:"views",btn:"open-sm"}, "tb-traits":{panel:"views",btn:"open-tm"} };
            function updateToolbarButtons() {
                Object.keys(panelMap).forEach(function(tbId) {
                    var pm = panelMap[tbId], gjsBtn = editorInstance.Panels.getButton(pm.panel, pm.btn), ourBtn = document.getElementById(tbId);
                    if (ourBtn && gjsBtn) { if (gjsBtn.get("active")) ourBtn.classList.add("active"); else ourBtn.classList.remove("active"); }
                });
            }
            Object.keys(panelMap).forEach(function(tbId) {
                var btn = document.getElementById(tbId); if (!btn) return;
                btn.addEventListener("click", function() { var pm = panelMap[tbId], gjsBtn = editorInstance.Panels.getButton(pm.panel, pm.btn); if (gjsBtn) gjsBtn.set("active", !gjsBtn.get("active")); updateToolbarButtons(); });
            });
            editorInstance.on("run", updateToolbarButtons); editorInstance.on("stop", updateToolbarButtons);
            setTimeout(updateToolbarButtons, 100);

            // Cacher la section "Classes CSS" du gestionnaire de styles (fallback JS)
            setTimeout(function(){ var el=document.querySelector(".gjs-clm-tags"); if(el) el.style.display="none"; el=document.querySelector(".gjs-clm-sels-info"); if(el) el.style.display="none"; el=document.querySelector(".gjs-clm-sels"); if(el) el.style.display="none"; }, 100);

            var tbUndo = document.getElementById("tb-undo"), tbRedo = document.getElementById("tb-redo");
            if (tbUndo) tbUndo.addEventListener("click", function() { editorInstance.runCommand("core:undo"); });
            if (tbRedo) tbRedo.addEventListener("click", function() { editorInstance.runCommand("core:redo"); });

            var tbOutline = document.getElementById("tb-outline");
            if (tbOutline) {
                tbOutline.addEventListener("click", function() { var btn = editorInstance.Panels.getButton("options", "sw-visibility"); if (btn) { btn.set("active", !btn.get("active")); tbOutline.classList.toggle("active", btn.get("active")); } });
                editorInstance.on("run", function() { var btn = editorInstance.Panels.getButton("options", "sw-visibility"); if (btn && tbOutline) tbOutline.classList.toggle("active", btn.get("active")); });
                editorInstance.on("stop", function() { var btn = editorInstance.Panels.getButton("options", "sw-visibility"); if (btn && tbOutline) tbOutline.classList.toggle("active", btn.get("active")); });
                setTimeout(function() { var btn = editorInstance.Panels.getButton("options", "sw-visibility"); if (btn && tbOutline) tbOutline.classList.toggle("active", btn.get("active")); }, 200);
            }

            var tbPreview = document.getElementById("tb-preview"), tbCode = document.getElementById("tb-code"), tbGallery = document.getElementById("tb-gallery");
            if (tbPreview) tbPreview.addEventListener("click", function() { editorInstance.runCommand("core:preview"); });
            if (tbCode) tbCode.addEventListener("click", function() { editorInstance.runCommand("core:open-code"); });
            if (tbGallery) tbGallery.addEventListener("click", function() { openGallery(editorInstance); });

            // === APERÇU RESPONSIVE : boutons Ordinateur / Tablette / Mobile ===
            (function initDeviceSwitcher() {
                var container = document.getElementById("editor-device-switcher");
                if (!container) return;
                var dm = editorInstance.Devices;
                // S'assurer que les 3 devices existent
                if (!dm.get('tablet')) dm.add({ id: 'tablet', name: 'Tablette', width: '768px', widthMedia: '992px' });
                if (!dm.get('mobile')) dm.add({ id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '576px' });
                var devices = [
                    { id: 'desktop', icon: '🖥️', title: 'Aperçu ordinateur' },
                    { id: 'tablet', icon: '📱', title: 'Aperçu tablette (768px)' },
                    { id: 'mobile', icon: '📲', title: 'Aperçu mobile (375px)' }
                ];
                devices.forEach(function(d) {
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.title = d.title;
                    btn.textContent = d.icon;
                    btn.dataset.device = d.id;
                    btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;background:transparent;border-radius:6px;cursor:pointer;font-size:1rem;color:#78716c;transition:all 0.15s;';
                    btn.addEventListener('click', function() {
                        editorInstance.setDevice(d.id === 'desktop' ? 'Desktop' : d.id);
                        container.querySelectorAll('button').forEach(function(b) { b.style.background = 'transparent'; });
                        btn.style.background = '#f5f3f0';
                    });
                    container.appendChild(btn);
                });
                // Activer desktop par défaut visuellement
                var first = container.querySelector('button');
                if (first) first.style.background = '#f5f3f0';
                // Synchro si le device change autrement
                editorInstance.on('change:device', function() {
                    var current = editorInstance.getDevice() || 'Desktop';
                    container.querySelectorAll('button').forEach(function(b) {
                        var isActive = (current === 'Desktop' && b.dataset.device === 'desktop') || current === b.dataset.device;
                        b.style.background = isActive ? '#f5f3f0' : 'transparent';
                    });
                });
            })();

            // === CONFIRMATION AVANT SUPPRESSION D'UN BLOC ===
            // Intercepte la commande de suppression pour demander confirmation
            (function initDeleteConfirm() {
                var origDelete = editorInstance.Commands.get('core:component-delete');
                editorInstance.Commands.add('core:component-delete', {
                    run: function(ed, sender, opts) {
                        var sel = ed.getSelected();
                        if (sel) {
                            var name = sel.getName ? sel.getName() : 'ce bloc';
                            if (!confirm('Supprimer « ' + name + ' » ?\n(Vous pourrez annuler avec ↩️)')) return;
                        }
                        // Comportement natif : supprimer les composants sélectionnés
                        var components = opts && opts.component ? [opts.component] : ed.getSelectedAll();
                        components.filter(Boolean).forEach(function(c) { if (!c.get('removable')) return; c.remove(); });
                        return components;
                    }
                });
            })();

            // === SAUVEGARDE AUTOMATIQUE (toutes les 60s si modifications) ===
            addInterval(function() {
                if (!editorInstance) return;
                if (editorInstance.getDirtyCount() > 0) {
                    autoSaveAjax();
                }
            }, 60000);

            var tbClear = document.getElementById("tb-clear");
            if (tbClear) tbClear.addEventListener("click", function() { if (confirm("Vider tout le contenu de la page ? Cette action est irréversible.")) editorInstance.runCommand("core:canvas-clear"); });

            // === NOMS FRANÇAIS POUR LES TYPES DE COMPOSANTS ===
            var typeNames = { head:'Titre', header:'Titre', text:'Texte', paragraph:'Texte', image:'Image', 'bs-image':'Image', link:'Lien', button:'Bouton', section:'Section', container:'Conteneur', row:'Ligne', column:'Colonne', video:'Vidéo', list:'Liste', map:'Carte', input:'Champ', form:'Formulaire', label:'Étiquette', default:'Bloc', wrapper:'Page' };
            // Surcharger getName() sur le prototype de tous les composants
            var defType = editorInstance.DomComponents.getType('default');
            if (defType && defType.model && defType.model.prototype) {
                var origGetName = defType.model.prototype.getName;
                defType.model.prototype.getName = function() {
                    var raw = (origGetName ? origGetName.call(this) : '') || this.get('type') || this.get('tagName') || '';
                    return typeNames[raw] || raw || 'Bloc';
                };
            }
            // Forcer la mise à jour du nom pour les composants existants
            setTimeout(function(){ editorInstance.Pages.getAll().forEach(function(p){ p.getMainComponent().find('*').forEach(function(c){ var tn=typeNames[c.get('type')]; if(tn)c.set('name',tn); }); }); }, 300);
            editorInstance.on('component:add', function(c){ var tn=typeNames[c.get('type')]; if(tn) setTimeout(function(){ c.set('name', tn); }, 50); });

            var statusComp = document.getElementById("statusbar-component"), statusSaved = document.getElementById("statusbar-saved");
            editorInstance.on("component:selected", function(component) { if (statusComp && component) { var name = component.getName ? component.getName() : (component.get("type") || "élément"), tag = component.get("tagName") || ""; statusComp.textContent = "🔍 " + name + (tag ? " <" + tag + ">" : ""); } });
            editorInstance.on("component:deselected", function() { if (statusComp) statusComp.textContent = "Aucun élément sélectionné"; });
            // Indicateur modifié/sauvegardé fiable (B8) : événementiel plutôt que polling
            editorInstance.on("update", function() { if (statusSaved) { var dirty = editorInstance.getDirtyCount(); statusSaved.textContent = dirty > 0 ? ("📝 " + dirty + " modification(s) non enregistrée(s)") : "💾 Sauvegardé"; } });

            var b = editorInstance.Panels.getButton("views", "open-blocks"); if (b) b.set("active", true);
            updateToolbarButtons();

            // === BOUTONS MONTER/DESCENDRE sur le bloc sélectionné ===
            editorInstance.on('component:selected', function(comp) {
                comp.set('showToolbar', true);
                var tb = comp.get('toolbar');
                if (!tb || !Array.isArray(tb)) tb = [];
                var hasUp = tb.some(function(b){ return b._moveUp === true; });
                if (!hasUp) {
                    var ed = editorInstance;
                    function moveComp(dir) {
                        var c = ed.getSelected();
                        if (!c) return;
                        // Remonter jusqu'au premier parent qui a des frères/soeurs
                        var orig = c, p = c.parent();
                        while (p && p.components().length <= 1 && p.parent()) { c = p; p = c.parent(); }
                        if (!p) return;
                        var s = p.components(), i = s.indexOf(c);
                        // Sauvegarder les styles inline (GrapesJS les stocke en interne, pas dans l'attribut HTML)
                        var savedStyle = c.getStyle ? c.getStyle() : {};
                        if (dir < 0 && i > 0) { p.components().remove(c); p.components().add(c, {at: i - 1}); }
                        if (dir > 0 && i >= 0 && i < s.length - 1) { p.components().remove(c); p.components().add(c, {at: i + 1}); }
                        // Restaurer les styles après déplacement
                        if (c.setStyle && typeof savedStyle === 'object') c.setStyle(savedStyle);
                        // Forcer désélection puis resélection pour repositionner la toolbar
                        ed.select(null);
                        setTimeout(function(){ ed.select(c); }, 60);
                    }
                    tb.push(
                        { label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>', attributes: { title: 'Monter (remonter le bloc)' }, command: function(){ moveComp(-1); }, _moveUp: true },
                        { label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 16l6-6-1.41-1.41L12 13.17l-4.59-4.58L6 10z"/></svg>', attributes: { title: 'Descendre (abaisser le bloc)' }, command: function(){ moveComp(1); }, _moveDown: true }
                    );
                    comp.set('toolbar', tb);
                }
            });

            // === REFONTE BLOCS ===
            var idsToRemove = [];
            editorInstance.Blocks.getAll().forEach(function(block) { idsToRemove.push(block.get("id")); });
            idsToRemove.forEach(function(id) { editorInstance.Blocks.remove(id); });

            editorInstance.DomComponents.addType("carousel-img", { model: { defaults: { tagName: "img", attributes: { "class": "d-block w-100" }, traits: [{ type: "text", label: "URL de l'image", name: "src", placeholder: "https://..." },{ type: "text", label: "Texte alternatif", name: "alt" }] } } });
            var bt = editorInstance.DomComponents.getType("button");
            if (bt) { var h = bt.model.prototype.defaults.traits.some(function(t){return t.name==="href";}); if (!h) bt.model.prototype.defaults.traits.unshift({type:"text",label:"Lien (href)",name:"href",placeholder:"https://..."}); }
            var lt = editorInstance.DomComponents.getType("link");
            if (lt && lt.model.prototype.classesChanged) lt.model.prototype.classesChanged = function(){};
            function uid(p) { return p + '-' + Math.random().toString(36).substring(2, 8); }

            // === SIMPLIFIER LES TRAITS DE COLONNES ===
            // Remplacer XS/SM/MD/LG/XL Width par un simple sélecteur de pourcentage
            (function simplifyColumnTraits() {
                var dc = editorInstance.DomComponents;
                // Attendre que le plugin bootstrap4 ait enregistré le type 'column'
                setTimeout(function() {
                    var colType = dc.getType('column');
                    if (!colType) return;
                    var origModel = colType.model;
                    // Sauvegarder l'init original
                    var origInit = origModel.prototype.init;
                    origModel.prototype.init = function() {
                        origInit.apply(this, arguments);
                        // Remplacer les traits complexes par une version simplifiée
                        this.set('traits', [
                            {
                                type: 'select',
                                label: 'Largeur',
                                name: 'colWidth',
                                options: [
                                    { value: '12', name: '100% — Pleine largeur' },
                                    { value: '9', name: '75% — Trois quarts' },
                                    { value: '8', name: '66% — Deux tiers' },
                                    { value: '6', name: '50% — Moitié' },
                                    { value: '4', name: '33% — Un tiers' },
                                    { value: '3', name: '25% — Un quart' },
                                ],
                                changeProp: true
                            }
                        ]);
                        var self = this;
                        this.listenTo(this, 'change:colWidth', function() {
                            var w = this.get('colWidth') || '6';
                            var cls = this.get('attributes')['class'] || '';
                            // Retirer les anciennes classes col-*
                            cls = cls.replace(/\bcol-(sm|md|lg|xl)?-\d{1,2}\b/g, '').replace(/\s+/g, ' ').trim();
                            // Ajouter col-12 pour mobile + col-md-{w} pour desktop
                            cls = (cls + ' col-12 col-md-' + w).trim();
                            this.addAttributes({ 'class': cls });
                        });
                    };
                    // Mettre à jour les colonnes déjà existantes dans le canvas
                    editorInstance.Pages.getAll().forEach(function(page) {
                        page.getMainComponent().find('column').forEach(function(col) {
                            var cls = col.get('attributes')['class'] || '';
                            var m = cls.match(/col-md-(\d{1,2})/);
                            var w = m ? m[1] : '6';
                            col.set('colWidth', w);
                            col.set('traits', [
                                {
                                    type: 'select', label: 'Largeur', name: 'colWidth',
                                    options: [
                                        { value: '12', name: '100% — Pleine largeur' },
                                        { value: '9', name: '75% — Trois quarts' },
                                        { value: '8', name: '66% — Deux tiers' },
                                        { value: '6', name: '50% — Moitié' },
                                        { value: '4', name: '33% — Un tiers' },
                                        { value: '3', name: '25% — Un quart' },
                                    ],
                                    changeProp: true
                                }
                            ]);
                            // Rebrancher l'écouteur
                            col.listenTo(col, 'change:colWidth', function() {
                                var w2 = col.get('colWidth') || '6';
                                var cls2 = col.get('attributes')['class'] || '';
                                cls2 = cls2.replace(/\bcol-(sm|md|lg|xl)?-\d{1,2}\b/g, '').replace(/\s+/g, ' ').trim();
                                cls2 = (cls2 + ' col-12 col-md-' + w2).trim();
                                col.addAttributes({ 'class': cls2 });
                            });
                        });
                    });
                }, 500);
            })();

            // Mise en page
            editorInstance.Blocks.add("layout-section",{label:"📄 Section",category:"📐 Mise en page",media:'<i class="fa fa-square" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5"><div class="container"><h2 class="text-center font-weight-bold">Titre de section</h2><p class="text-center mt-3 mx-auto" style="color:#6b647a;max-width:600px;">Sous-titre descriptif pour cette section.</p></div></section>'});
            editorInstance.Blocks.add("layout-1col",{label:"▦ 1 Colonne",category:"📐 Mise en page",media:'<i class="fa fa-square" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="container"><div class="row"><div class="col-12 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div></div></div>'});
            editorInstance.Blocks.add("layout-divider",{label:"➖ Séparateur",category:"📐 Mise en page",media:'<i class="fa fa-minus" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<hr class="w-100 my-4" style="border:0;border-top:2px solid #e5e0d8;">'});
            editorInstance.Blocks.add("layout-2col",{label:"▦ 2 Col. 50/50",category:"📐 Mise en page",media:'<i class="fa fa-columns" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="container"><div class="row"><div class="col-md-6 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div><div class="col-md-6 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div></div></div>'});
            editorInstance.Blocks.add("layout-2col-25-75",{label:"▦ 2 Col. 25/75",category:"📐 Mise en page",media:'<i class="fa fa-columns" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="container"><div class="row"><div class="col-md-3 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div><div class="col-md-9 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div></div></div>'});
            editorInstance.Blocks.add("layout-2col-75-25",{label:"▦ 2 Col. 75/25",category:"📐 Mise en page",media:'<i class="fa fa-columns" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="container"><div class="row"><div class="col-md-9 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div><div class="col-md-3 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div></div></div>'});
            editorInstance.Blocks.add("layout-3col",{label:"▦ 3 Colonnes",category:"📐 Mise en page",media:'<i class="fa fa-columns" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="container"><div class="row"><div class="col-md-4 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div><div class="col-md-4 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div><div class="col-md-4 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div></div></div>'});
            editorInstance.Blocks.add("layout-4col",{label:"▦ 4 Colonnes",category:"📐 Mise en page",media:'<i class="fa fa-columns" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="container"><div class="row"><div class="col-md-3 col-sm-6 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div><div class="col-md-3 col-sm-6 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div><div class="col-md-3 col-sm-6 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div><div class="col-md-3 col-sm-6 p-3" style="min-height:80px;border:1px dashed #e5e0d8;"></div></div></div>'});
            editorInstance.Blocks.add("layout-linkbox",{label:"🔗 Lien Carte",category:"📐 Mise en page",media:'<i class="fa fa-link" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<a href="#" class="d-block text-decoration-none p-4 rounded-lg" style="color:inherit;border:1px solid #e5e0d8;"><div class="d-flex align-items-start"><div style="font-size:2rem;">📌</div><div class="ml-3"><h4 class="font-weight-bold mb-1">Titre de la carte</h4><p class="mb-0" style="color:#6b647a;">Description courte. Cette carte entière est cliquable.</p></div></div></a>'});
            editorInstance.Blocks.add("layout-imagebox",{label:"🖼️ Image + Texte",category:"📐 Mise en page",media:'<i class="fa fa-image" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="rounded overflow-hidden border bg-white"><img src="https://placehold.co/600x400/d4845a/ffffff?text=Image" alt="Image" class="w-100 d-block"><div class="p-3"><h5 class="font-weight-bold">Titre de l\'image</h5><p style="color:#6b647a;">Description ou légende de cette image.</p></div></div>'});

            // Composants
            editorInstance.Blocks.add("comp-card",{label:"🃏 Carte vide",category:"🎨 Composants",media:'<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="3" width="20" height="16" rx="3" fill="none" stroke="#d4845a" stroke-width="1.5"/></svg>',content:'<div style="background:#ffffff;border:1px solid #e9ecef;border-radius:1rem;padding:2rem;min-height:120px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.07);">Glissez du contenu ici (texte, image, bouton...).</div>'});
            editorInstance.Blocks.add("comp-card-titled",{label:"🃏 Carte avec titre",category:"🎨 Composants",media:'<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="3" width="20" height="16" rx="3" fill="none" stroke="#d4845a" stroke-width="1.5"/><text x="12" y="13" text-anchor="middle" fill="#d4845a" font-size="7" font-weight="bold">T</text></svg>',content:'<div style="background:#ffffff;border:1px solid #e9ecef;border-radius:1rem;padding:2rem;box-shadow:0 4px 6px -1px rgba(0,0,0,0.07);"><h3 style="font-size:1.25rem;font-weight:700;color:#212529;margin-bottom:0.75rem;">Titre de la carte</h3><p style="color:#495057;font-size:0.95rem;line-height:1.6;margin:0;">Double-cliquez pour modifier ce texte. Ajoutez votre contenu dans cette carte.</p></div>'});
            // Carte avec bordure supérieure colorée (style Accueil)
            editorInstance.Blocks.add("comp-card-accent",{label:"🃏 Carte accent",category:"🎨 Composants",media:'<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="3" width="20" height="16" rx="3" fill="none" stroke="#9d38da" stroke-width="1.5"/><line x1="2" y1="5" x2="22" y2="5" stroke="#9d38da" stroke-width="3"/></svg>',content:'<div style="background:#ffffff;border:none;border-top:4px solid #9d38da;border-radius:1rem;padding:2rem 1.5rem;box-shadow:0 2px 16px rgba(0,0,0,0.07);display:flex;flex-direction:column;justify-content:space-between;min-height:200px;"><div><span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;">📌</span><h3 style="font-weight:700;color:#212529;font-size:1.2rem;margin-bottom:0.5rem;">Titre de la carte</h3><p style="color:#6c757d;font-size:0.9rem;line-height:1.5;margin:0;">Description courte. Double-cliquez pour modifier.</p></div><a href="#" style="display:inline-block;margin-top:1rem;background:#9d38da;color:#fff;font-weight:600;padding:0.6rem 1.5rem;border-radius:0.4rem;text-decoration:none;align-self:flex-start;">Action</a></div>'});
            (function() { var aid=uid("accordion"),h1=uid("heading"),c1=uid("collapse"),h2=uid("heading"),c2=uid("collapse"),h3=uid("heading"),c3=uid("collapse"); editorInstance.Blocks.add("comp-accordion",{label:"📂 Accordéon",category:"🎨 Composants",media:'<i class="fa fa-caret-square-down" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="accordion" id="'+aid+'"><div class="card"><div class="card-header" id="'+h1+'"><h2 class="mb-0"><button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#'+c1+'" aria-expanded="true" aria-controls="'+c1+'">Section 1 — Cliquez pour ouvrir</button></h2></div><div id="'+c1+'" class="collapse show" aria-labelledby="'+h1+'" data-parent="#'+aid+'"><div class="card-body">Contenu de la section 1. Texte modifiable.</div></div></div><div class="card"><div class="card-header" id="'+h2+'"><h2 class="mb-0"><button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#'+c2+'" aria-expanded="false" aria-controls="'+c2+'">Section 2 — Cliquez pour ouvrir</button></h2></div><div id="'+c2+'" class="collapse" aria-labelledby="'+h2+'" data-parent="#'+aid+'"><div class="card-body">Contenu de la section 2. Texte modifiable.</div></div></div><div class="card"><div class="card-header" id="'+h3+'"><h2 class="mb-0"><button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#'+c3+'" aria-expanded="false" aria-controls="'+c3+'">Section 3 — Cliquez pour ouvrir</button></h2></div><div id="'+c3+'" class="collapse" aria-labelledby="'+h3+'" data-parent="#'+aid+'"><div class="card-body">Contenu de la section 3. Texte modifiable.</div></div></div></div>'}); })();
            editorInstance.Blocks.add("comp-jumbotron",{label:"📢 Bandeau",category:"🎨 Composants",media:'<i class="fa fa-bullhorn" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="jumbotron"><h1 class="display-4">Titre important</h1><p class="lead">Un message clé en avant, avec du texte d\'accompagnement.</p><hr class="my-4"><p>Plus de détails ou un appel à l\'action.</p><a class="btn btn-lg font-weight-bold" href="#" role="button" style="background:#d4845a;color:#fff;">Action principale</a></div>'});
            editorInstance.Blocks.add("comp-listgroup",{label:"📋 Liste",category:"🎨 Composants",media:'<i class="fa fa-list-ul" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<ul class="list-group"><li class="list-group-item active" style="background:#d4845a;border-color:#d4845a;">Élément actif</li><li class="list-group-item">Deuxième élément</li><li class="list-group-item">Troisième élément</li><li class="list-group-item">Quatrième élément</li><li class="list-group-item">Cinquième élément</li></ul>'});
            editorInstance.Blocks.add("comp-alert",{label:"⚠️ Alerte",category:"🎨 Composants",media:'<i class="fa fa-exclamation-triangle" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="alert alert-warning alert-dismissible fade show" role="alert"><strong>Attention !</strong> Ceci est un message d\'alerte important.<button type="button" class="close" data-dismiss="alert" aria-label="Fermer"><span aria-hidden="true">&times;</span></button></div>'});
            (function() { var tid=uid("tabs"),t1=uid("tab"),t2=uid("tab"),t3=uid("tab"); editorInstance.Blocks.add("comp-tabs",{label:"📑 Onglets",category:"🎨 Composants",media:'<i class="fa fa-folder" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<ul class="nav nav-tabs" id="'+tid+'" role="tablist"><li class="nav-item"><a class="nav-link active" id="'+t1+'-tab" data-toggle="tab" href="#'+t1+'" role="tab" aria-controls="'+t1+'" aria-selected="true">Onglet 1</a></li><li class="nav-item"><a class="nav-link" id="'+t2+'-tab" data-toggle="tab" href="#'+t2+'" role="tab" aria-controls="'+t2+'" aria-selected="false">Onglet 2</a></li><li class="nav-item"><a class="nav-link" id="'+t3+'-tab" data-toggle="tab" href="#'+t3+'" role="tab" aria-controls="'+t3+'" aria-selected="false">Onglet 3</a></li></ul><div class="tab-content" id="'+tid+'Content"><div class="tab-pane fade show active" id="'+t1+'" role="tabpanel" aria-labelledby="'+t1+'-tab"><div class="p-3 border" style="border-color:#e5e0d8 !important;border-top:0 !important;">Contenu de l\'onglet 1.</div></div><div class="tab-pane fade" id="'+t2+'" role="tabpanel" aria-labelledby="'+t2+'-tab"><div class="p-3 border" style="border-color:#e5e0d8 !important;border-top:0 !important;">Contenu de l\'onglet 2.</div></div><div class="tab-pane fade" id="'+t3+'" role="tabpanel" aria-labelledby="'+t3+'-tab"><div class="p-3 border" style="border-color:#e5e0d8 !important;border-top:0 !important;">Contenu de l\'onglet 3.</div></div></div>'}); })();

            // Texte
            editorInstance.Blocks.add("text-heading",{label:"📌 Titre",category:"📝 Texte",media:'<i class="fa fa-heading" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<h2 class="font-weight-bold text-dark mb-2">Titre de votre section</h2>'});
            editorInstance.Blocks.add("text-paragraph",{label:"¶ Paragraphe",category:"📝 Texte",media:'<i class="fa fa-paragraph" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<p class="mb-3" style="color:#6b647a;">Double-cliquez pour modifier ce paragraphe. Vous pouvez le mettre en forme avec la barre d\'outils de texte (police, taille, couleur).</p>'});
            editorInstance.Blocks.add("text-quote",{label:"💬 Citation",category:"📝 Texte",media:'<i class="fa fa-quote-right" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<blockquote class="my-4 p-3" style="border-left:4px solid #d4845a;background:#fdf0e6;border-radius:0 8px 8px 0;"><p class="mb-0 font-italic" style="font-size:1.1rem;color:#6b647a;">« Double-cliquez pour modifier cette citation. »</p><footer class="mt-2" style="font-size:0.85rem;color:#6b647a;">— Auteur</footer></blockquote>'});
            editorInstance.Blocks.add("text-lead",{label:"📢 Texte mis en avant",category:"📝 Texte",media:'<i class="fa fa-text-height" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<p class="lead" style="font-size:1.25rem;color:#6b647a;">Un paragraphe mis en avant pour attirer l\'attention du lecteur. Idéal pour un résumé ou une accroche.</p>'});

            // Médias
            editorInstance.Blocks.add("media-image",{label:"🖼️ Image",category:"🖼️ Médias",media:'<i class="fa fa-image" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div><img src="https://placehold.co/600x400/d4845a/ffffff?text=Image" alt="Description de l\'image" class="img-fluid rounded"></div>'});
            // Bloc vidéo : carte cliquable vers la vidéo (les iframes sont bloquées par le sanitizer serveur — sécurité)
            editorInstance.Blocks.add("media-video",{label:"🎬 Vidéo",category:"🖼️ Médias",media:'<i class="fa fa-video" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<a href="https://www.youtube.com/watch?v=XXXXXXXX" target="_blank" rel="noopener noreferrer" class="d-block position-relative rounded overflow-hidden text-decoration-none" style="background:#2d2540;"><img src="https://placehold.co/800x450/2d2540/ffffff?text=Vid%C3%A9o" alt="Aperçu vidéo" class="w-100 d-block" style="opacity:0.85;"><span class="position-absolute" style="top:50%;left:50%;transform:translate(-50%,-50%);font-size:4rem;">▶️</span></a>'});

            // Navigation
            editorInstance.Blocks.add("nav-button",{label:"🔘 Bouton",category:"🔗 Navigation",media:'<i class="fa fa-square-caret-right" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<a href="#" class="btn btn-lg rounded font-weight-bold text-decoration-none" role="button" style="background:#d4845a;color:#fff;padding:0.75rem 2rem;">Cliquez ici</a>'});
            editorInstance.Blocks.add("nav-link",{label:"🔗 Lien",category:"🔗 Navigation",media:'<i class="fa fa-link" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<a href="#" style="color:#d4845a;">Lien vers une autre page</a>'});

            // Formulaire
            editorInstance.Blocks.add("form-group",{label:"✏️ Champ texte",category:"📋 Formulaire",media:'<i class="fa fa-i-cursor" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="form-group"><label class="font-weight-bold text-dark">Libellé du champ</label><input type="text" class="form-control" placeholder="Saisissez votre texte..." style="border-color:#d4845a;"></div>'});
            editorInstance.Blocks.add("form-textarea",{label:"📝 Zone de texte",category:"📋 Formulaire",media:'<i class="fa fa-align-left" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="form-group"><label class="font-weight-bold text-dark">Votre message</label><textarea class="form-control" rows="4" placeholder="Écrivez votre message ici..." style="border-color:#d4845a;"></textarea></div>'});
            editorInstance.Blocks.add("form-checkbox",{label:"☑️ Case à cocher",category:"📋 Formulaire",media:'<i class="fa fa-check-square" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<div class="form-check"><input class="form-check-input" type="checkbox" id=""><label class="form-check-label text-dark">J\'accepte les conditions</label></div>'});
            editorInstance.Blocks.add("form-submit",{label:"🚀 Bouton envoi",category:"📋 Formulaire",media:'<i class="fa fa-paper-plane" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<button type="submit" class="btn btn-lg rounded font-weight-bold" style="background:#d4845a;color:#fff;padding:0.75rem 2rem;">Envoyer</button>'});

            // === COMPOSITIONS (blocs multi-éléments) ===
            editorInstance.Blocks.add("compo-hero",{label:"🎯 Bannière Hero",category:"🧩 Compositions",media:'<i class="fa fa-star" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5" style="background-color:#f5f3f0;"><div class="container text-center"><h1 class="display-4 font-weight-bold" style="color:#2d2540;">Titre principal</h1><p class="lead mt-3 mx-auto mb-4" style="max-width:600px;color:#6b647a;">Sous-titre accrocheur qui présente votre message. Double-cliquez pour modifier ce texte.</p><a href="#" class="btn btn-lg font-weight-bold" style="background:#d4845a;color:#fff;padding:0.75rem 2rem;">Action</a></div></section>'});
            editorInstance.Blocks.add("compo-cards3",{label:"🃏 Cartes x3",category:"🧩 Compositions",media:'<i class="fa fa-th-large" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5"><div class="container"><div class="row"><div class="col-12 text-center mb-4"><h2 class="font-weight-bold">Nos services</h2><p style="color:#6b647a;">Découvrez ce que nous proposons.</p></div></div><div class="row"><div class="col-md-4 mb-4"><div class="card border-0 shadow-sm compo-c1"><img src="https://placehold.co/600x400/d4845a/ffffff?text=Service+1" class="card-img-top compo-img1" alt="Service 1"><div class="card-body"><h5 class="font-weight-bold">Service 1</h5><p class="card-text" style="color:#6b647a;">Description du premier service.</p><a href="#" class="btn btn-sm font-weight-bold" style="background:#d4845a;color:#fff;">En savoir +</a></div></div></div><div class="col-md-4 mb-4"><div class="card border-0 shadow-sm compo-c2"><img src="https://placehold.co/600x400/2d2540/ffffff?text=Service+2" class="card-img-top compo-img2" alt="Service 2"><div class="card-body"><h5 class="font-weight-bold">Service 2</h5><p class="card-text" style="color:#6b647a;">Description du deuxième service.</p><a href="#" class="btn btn-sm font-weight-bold" style="background:#d4845a;color:#fff;">En savoir +</a></div></div></div><div class="col-md-4 mb-4"><div class="card border-0 shadow-sm compo-c3"><img src="https://placehold.co/600x400/6b647a/ffffff?text=Service+3" class="card-img-top compo-img3" alt="Service 3"><div class="card-body"><h5 class="font-weight-bold">Service 3</h5><p class="card-text" style="color:#6b647a;">Description du troisième service.</p><a href="#" class="btn btn-sm font-weight-bold" style="background:#d4845a;color:#fff;">En savoir +</a></div></div></div></div></div></section>'});
            editorInstance.Blocks.add("compo-textimg",{label:"📰 Texte + Image",category:"🧩 Compositions",media:'<i class="fa fa-newspaper" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5"><div class="container"><div class="row align-items-center"><div class="col-md-6 mb-4 mb-md-0"><h2 class="font-weight-bold mb-3">Titre de la section</h2><p style="color:#6b647a;">Paragraphe de texte descriptif. Double-cliquez pour modifier ce contenu et ajouter votre message.</p><p style="color:#6b647a;">Second paragraphe avec des informations complémentaires.</p><a href="#" class="btn font-weight-bold mt-2" style="background:#d4845a;color:#fff;">Découvrir</a></div><div class="col-md-6"><img src="https://placehold.co/600x400/d4845a/ffffff?text=Illustration" alt="Illustration" class="img-fluid rounded shadow-sm"></div></div></div></section>'});
            editorInstance.Blocks.add("compo-stats",{label:"📊 Chiffres Clés",category:"🧩 Compositions",media:'<i class="fa fa-chart-bar" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5" style="background-color:#f5f3f0;"><div class="container"><div class="row text-center"><div class="col-6 col-md-3 mb-4 compo-s1"><div class="display-4 font-weight-bold" style="color:#d4845a;">250+</div><h6 class="font-weight-bold mt-2">Projets</h6><p class="small" style="color:#6b647a;">Réalisés avec succès</p></div><div class="col-6 col-md-3 mb-4 compo-s2"><div class="display-4 font-weight-bold" style="color:#d4845a;">50</div><h6 class="font-weight-bold mt-2">Experts</h6><p class="small" style="color:#6b647a;">À votre service</p></div><div class="col-6 col-md-3 mb-4 compo-s3"><div class="display-4 font-weight-bold" style="color:#d4845a;">15</div><h6 class="font-weight-bold mt-2">Années</h6><p class="small" style="color:#6b647a;">D\'expérience</p></div><div class="col-6 col-md-3 mb-4 compo-s4"><div class="display-4 font-weight-bold" style="color:#d4845a;">100%</div><h6 class="font-weight-bold mt-2">Satisfaction</h6><p class="small" style="color:#6b647a;">Clients satisfaits</p></div></div></div></section>'});
            editorInstance.Blocks.add("compo-contact",{label:"📬 Contact Split",category:"🧩 Compositions",media:'<i class="fa fa-envelope" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-0"><div class="container-fluid p-0"><div class="row no-gutters"><div class="col-md-6" style="background:#2d2540;"><div class="p-5 text-white"><h2 class="font-weight-bold mb-3">Contactez-nous</h2><p class="mb-4" style="opacity:0.85;">Une question ? Un projet ? Écrivez-nous.</p><form><div class="form-group"><input type="text" class="form-control" placeholder="Votre nom" style="border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;"></div><div class="form-group"><input type="email" class="form-control" placeholder="Votre email" style="border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;"></div><div class="form-group"><textarea class="form-control" rows="3" placeholder="Votre message" style="border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;"></textarea></div><button type="submit" class="btn btn-lg font-weight-bold w-100" style="background:#d4845a;color:#fff;">Envoyer le message</button></form></div></div><div class="col-md-6" style="background-color:#f5f3f0;"><div class="p-5"><h2 class="font-weight-bold mb-4">Nos coordonnées</h2><div class="mb-3"><i class="fa fa-map-marker-alt mr-2" style="color:#d4845a;"></i><span>71 avenue E. Vaillant, 92100 Boulogne</span></div><div class="mb-3"><i class="fa fa-phone mr-2" style="color:#d4845a;"></i><span>01 23 45 67 89</span></div><div class="mb-3"><i class="fa fa-envelope mr-2" style="color:#d4845a;"></i><span>contact@cncdp.fr</span></div></div></div></div></div></section>'});
            // === Nouveaux blocs (audit 21/07/2026) ===
            editorInstance.Blocks.add("compo-testimonials",{label:"💬 Témoignages",category:"🧩 Compositions",media:'<i class="fa fa-comments" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5" style="background-color:#f5f3f0;"><div class="container"><div class="row"><div class="col-12 text-center mb-4"><h2 class="font-weight-bold">Ils témoignent</h2></div></div><div class="row"><div class="col-md-4 mb-4"><div class="card border-0 shadow-sm h-100 tmn-c1"><div class="card-body p-4"><div style="color:#d4845a;font-size:1.5rem;">★★★★★</div><p class="font-italic mt-3" style="color:#6b647a;">« Double-cliquez pour modifier ce témoignage. Un retour d\'expérience positif. »</p><div class="d-flex align-items-center mt-3"><div class="rounded-circle d-flex align-items-center justify-content-center mr-3" style="width:48px;height:48px;background:#d4845a;color:#fff;font-weight:700;">AB</div><div><strong>Prénom Nom</strong><br><small style="color:#6b647a;">Fonction</small></div></div></div></div></div><div class="col-md-4 mb-4"><div class="card border-0 shadow-sm h-100 tmn-c2"><div class="card-body p-4"><div style="color:#d4845a;font-size:1.5rem;">★★★★★</div><p class="font-italic mt-3" style="color:#6b647a;">« Second témoignage à personnaliser. Retour authentique d\'un utilisateur. »</p><div class="d-flex align-items-center mt-3"><div class="rounded-circle d-flex align-items-center justify-content-center mr-3" style="width:48px;height:48px;background:#2d2540;color:#fff;font-weight:700;">CD</div><div><strong>Prénom Nom</strong><br><small style="color:#6b647a;">Fonction</small></div></div></div></div></div><div class="col-md-4 mb-4"><div class="card border-0 shadow-sm h-100 tmn-c3"><div class="card-body p-4"><div style="color:#d4845a;font-size:1.5rem;">★★★★★</div><p class="font-italic mt-3" style="color:#6b647a;">« Troisième témoignage. Modifiez le texte, le nom et les initiales. »</p><div class="d-flex align-items-center mr-3 mt-3"><div class="rounded-circle d-flex align-items-center justify-content-center mr-3" style="width:48px;height:48px;background:#6b647a;color:#fff;font-weight:700;">EF</div><div><strong>Prénom Nom</strong><br><small style="color:#6b647a;">Fonction</small></div></div></div></div></div></div></div></section>'});
            (function() { var fid=uid("faq"),q1=uid("faqq"),q2=uid("faqq"),q3=uid("faqq"),q4=uid("faqq"); editorInstance.Blocks.add("compo-faq",{label:"❓ FAQ",category:"🧩 Compositions",media:'<i class="fa fa-question-circle" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5"><div class="container"><div class="row"><div class="col-lg-8 mx-auto"><h2 class="font-weight-bold text-center mb-4">Questions fréquentes</h2><div class="accordion" id="'+fid+'"><div class="card mb-2 border-0 shadow-sm"><div class="card-header bg-white border-0" id="h'+q1+'"><button class="btn btn-link btn-block text-left font-weight-bold text-decoration-none" type="button" data-toggle="collapse" data-target="#'+q1+'" style="color:#2d2540;">Première question fréquente ?</button></div><div id="'+q1+'" class="collapse show" data-parent="#'+fid+'"><div class="card-body" style="color:#6b647a;">Réponse à la première question. Double-cliquez pour modifier ce texte.</div></div></div><div class="card mb-2 border-0 shadow-sm"><div class="card-header bg-white border-0" id="h'+q2+'"><button class="btn btn-link btn-block text-left font-weight-bold text-decoration-none collapsed" type="button" data-toggle="collapse" data-target="#'+q2+'" style="color:#2d2540;">Deuxième question fréquente ?</button></div><div id="'+q2+'" class="collapse" data-parent="#'+fid+'"><div class="card-body" style="color:#6b647a;">Réponse à la deuxième question.</div></div></div><div class="card mb-2 border-0 shadow-sm"><div class="card-header bg-white border-0" id="h'+q3+'"><button class="btn btn-link btn-block text-left font-weight-bold text-decoration-none collapsed" type="button" data-toggle="collapse" data-target="#'+q3+'" style="color:#2d2540;">Troisième question fréquente ?</button></div><div id="'+q3+'" class="collapse" data-parent="#'+fid+'"><div class="card-body" style="color:#6b647a;">Réponse à la troisième question.</div></div></div><div class="card mb-2 border-0 shadow-sm"><div class="card-header bg-white border-0" id="h'+q4+'"><button class="btn btn-link btn-block text-left font-weight-bold text-decoration-none collapsed" type="button" data-toggle="collapse" data-target="#'+q4+'" style="color:#2d2540;">Quatrième question fréquente ?</button></div><div id="'+q4+'" class="collapse" data-parent="#'+fid+'"><div class="card-body" style="color:#6b647a;">Réponse à la quatrième question.</div></div></div></div></div></div></div></section>'}); })();
            editorInstance.Blocks.add("compo-cta",{label:"📣 Appel à l'action",category:"🧩 Compositions",media:'<i class="fa fa-bullseye" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5" style="background:linear-gradient(135deg,#2d2540,#443a58);"><div class="container text-center py-3"><h2 class="font-weight-bold text-white mb-3">Prêt à passer à l\'action ?</h2><p class="lead mb-4 mx-auto" style="color:rgba(255,255,255,0.8);max-width:550px;">Un message court et percutant qui invite le visiteur à agir maintenant.</p><a href="#" class="btn btn-lg font-weight-bold mr-2 mb-2" style="background:#d4845a;color:#fff;padding:0.75rem 2.5rem;">Commencer</a><a href="#" class="btn btn-lg btn-outline-light font-weight-bold mb-2" style="padding:0.75rem 2.5rem;">En savoir plus</a></div></section>'});
            editorInstance.Blocks.add("compo-gallery",{label:"🖼️ Galerie",category:"🧩 Compositions",media:'<i class="fa fa-images" style="font-size:1.2rem;color:#d4845a;"></i>',content:'<section class="py-5"><div class="container"><div class="row"><div class="col-12 text-center mb-4"><h2 class="font-weight-bold">Galerie</h2><p style="color:#6b647a;">Cliquez sur une image pour la remplacer.</p></div></div><div class="row"><div class="col-6 col-md-3 mb-3"><img src="https://placehold.co/400x400/d4845a/ffffff?text=1" alt="Photo 1" class="img-fluid rounded shadow-sm w-100"></div><div class="col-6 col-md-3 mb-3"><img src="https://placehold.co/400x400/2d2540/ffffff?text=2" alt="Photo 2" class="img-fluid rounded shadow-sm w-100"></div><div class="col-6 col-md-3 mb-3"><img src="https://placehold.co/400x400/6b647a/ffffff?text=3" alt="Photo 3" class="img-fluid rounded shadow-sm w-100"></div><div class="col-6 col-md-3 mb-3"><img src="https://placehold.co/400x400/fcbc63/2d2540?text=4" alt="Photo 4" class="img-fluid rounded shadow-sm w-100"></div><div class="col-6 col-md-3 mb-3"><img src="https://placehold.co/400x400/fd82bb/ffffff?text=5" alt="Photo 5" class="img-fluid rounded shadow-sm w-100"></div><div class="col-6 col-md-3 mb-3"><img src="https://placehold.co/400x400/9d38da/ffffff?text=6" alt="Photo 6" class="img-fluid rounded shadow-sm w-100"></div><div class="col-6 col-md-3 mb-3"><img src="https://placehold.co/400x400/daafff/2d2540?text=7" alt="Photo 7" class="img-fluid rounded shadow-sm w-100"></div><div class="col-6 col-md-3 mb-3"><img src="https://placehold.co/400x400/de6d11/ffffff?text=8" alt="Photo 8" class="img-fluid rounded shadow-sm w-100"></div></div></div></section>'});

            // === Style panneaux ===
            // Le thème visuel (couleurs, blocs) est maintenant en CSS statique dans le template (U6).
            // On garde juste le filtrage des catégories non-CNCDP, exécuté une seule fois.
            var ourCats = ['📐 Mise en page','🎨 Composants','📝 Texte','🖼️ Médias','🔗 Navigation','📋 Formulaire','🧩 Compositions'];
            function filterBlockCategories() {
                document.querySelectorAll('.gjs-block-category').forEach(function(cat) {
                    var t = cat.querySelector('.gjs-title');
                    if (t && ourCats.indexOf(t.textContent.trim()) === -1) cat.style.display = 'none';
                });
            }
            filterBlockCategories();
            // Ré-appliquer après ajout de blocs (une seule fois suffit car les catégories ne changent plus)
            setTimeout(filterBlockCategories, 800);

            var optsPanel = editorInstance.Panels.getPanel("options");
            if (optsPanel) { optsPanel.get("buttons").add({id:"templates-gallery",command:"open-gallery",className:"fa fa-th-large",attributes:{title:"Galerie de templates"},active:false}); editorInstance.Commands.add("open-gallery",{run:function(){openGallery(editorInstance);}}); }

            // RTE enrichment — ajout polices, tailles, couleurs
            (function initRteEnrichment() {
                var injected = false;
                function tryInject() {
                    if (injected) return;
                    var toolbar = document.querySelector('.gjs-rte-toolbar');
                    if (!toolbar || toolbar.style.display === 'none') return;
                    if (toolbar.querySelector('.cncdp-rte-custom')) { injected = true; return; }
                    var sep = document.createElement('span'); sep.className = 'gjs-rte-separator';
                    var fontSel = document.createElement('select'); fontSel.className = 'cncdp-rte-custom cncdp-rte-font'; fontSel.title = 'Police';
                    fontSel.innerHTML = '<option value="">Police…</option><option value="Inter">Inter</option><option value="Roboto">Roboto</option><option value="Open Sans">Open Sans</option><option value="Lato">Lato</option><option value="Georgia">Georgia</option><option value="Courier New">Courier</option><option value="Arial">Arial</option><option value="Times New Roman">Times</option>';
                    fontSel.onchange = function() { if (!this.value) return; var sel = editorInstance.getSelected(); if (sel && sel.addStyle) sel.addStyle({ 'font-family': this.value }); this.selectedIndex = 0; };
                    var sizeSel = document.createElement('select'); sizeSel.className = 'cncdp-rte-custom cncdp-rte-size'; sizeSel.title = 'Taille';
                    sizeSel.innerHTML = '<option value="">Taille…</option><option value="0.75rem">0.75 rem</option><option value="0.875rem">0.875 rem</option><option value="1rem">1 rem (normal)</option><option value="1.125rem">1.125 rem</option><option value="1.25rem">1.25 rem</option><option value="1.5rem">1.5 rem</option><option value="2rem">2 rem</option><option value="2.5rem">2.5 rem</option><option value="3rem">3 rem</option><option value="4rem">4 rem</option><option value="5rem">5 rem</option>';
                    sizeSel.onchange = function() { if (!this.value) return; var sel = editorInstance.getSelected(); if (sel && sel.addStyle) sel.addStyle({ 'font-size': this.value }); this.selectedIndex = 0; };
                    var colInp = document.createElement('input'); colInp.type = 'color'; colInp.className = 'cncdp-rte-custom cncdp-rte-color'; colInp.title = 'Couleur texte'; colInp.value = '#212529';
                    colInp.oninput = function() { var sel = editorInstance.getSelected(); if (sel && sel.addStyle) sel.addStyle({ 'color': this.value }); };
                    var bgInp = document.createElement('input'); bgInp.type = 'color'; bgInp.className = 'cncdp-rte-custom cncdp-rte-bgcolor'; bgInp.title = 'Surbrillance'; bgInp.value = '#ffff00';
                    bgInp.oninput = function() { var sel = editorInstance.getSelected(); if (sel && sel.addStyle) sel.addStyle({ 'background-color': this.value }); };
                    toolbar.appendChild(sep.cloneNode()); toolbar.appendChild(fontSel); toolbar.appendChild(sizeSel); toolbar.appendChild(sep.cloneNode()); toolbar.appendChild(colInp); toolbar.appendChild(bgInp); injected = true;
                }
                // Vérifier toutes les 500ms (nettoyé à la fermeture de l'éditeur)
                addInterval(tryInject, 500);
                // Aussi essayer au clic sur le canvas
                editorInstance.on('component:selected', function() { setTimeout(tryInject, 100); });
                editorInstance.on('component:update', function() { setTimeout(tryInject, 100); });
            })();
        });

        function sync() {
            var bodyHtml = editorInstance.getHtml(), css = editorInstance.getCss();
            if (css) { css = css.replace("body {margin: 0;}", 'body {margin:0;font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#212529;}'); htmlInput.value = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>" + css + "</style></head>" + bodyHtml + "</html>"; }
            else { htmlInput.value = bodyHtml; }
            grapesjsDataInput.value = JSON.stringify(editorInstance.getProjectData());
            try { editorInstance.store(); } catch(e) {}
            var statusSaved = document.getElementById("statusbar-saved"); if (statusSaved) statusSaved.textContent = "💾 Sauvegardé";
            showToast("Sauvegarde");
        }
        // Sauvegarde AJAX silencieuse (autosave) — remplit les champs et poste sans fermer
        function autoSaveAjax() {
            sync();
            var f = document.getElementById("page-form"), fd = new FormData(f), xhr = new XMLHttpRequest();
            xhr.open("POST", f.action);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var s = document.getElementById("statusbar-saved");
                    if (s) s.textContent = "💾 Sauvegarde auto — " + new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'});
                }
            };
            xhr.send(fd);
        }
        function showToast(msg) {
            var t = document.getElementById("editor-toast");
            if (!t) { t = document.createElement("div"); t.id = "editor-toast"; t.style.cssText = "position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#2d2540;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:600;z-index:99999;transition:opacity 0.3s;pointer-events:none;"; document.body.appendChild(t); }
            t.textContent = "\u2714 " + msg; t.style.opacity = "1"; clearTimeout(t._timeout); t._timeout = setTimeout(function(){ t.style.opacity = "0"; }, 1500);
        }
        document.getElementById("editor-save-progress-btn").addEventListener("click", function() { sync(); var f = document.getElementById("page-form"), fd = new FormData(f), xhr = new XMLHttpRequest(); xhr.open("POST", f.action); xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); xhr.onload = function() { if (xhr.status === 200) showToast("Sauvegarde en base"); }; xhr.send(fd); });
        document.getElementById("editor-save-btn").addEventListener("click", function() { sync(); overlay.style.display = "none"; document.getElementById("page-form").submit(); });
        document.getElementById("editor-close-btn").addEventListener("click", function() {
            var dirty = editorInstance ? editorInstance.getDirtyCount() : 0;
            var msg = dirty > 0 ? "Vous avez " + dirty + " modification(s) non enregistrée(s).\nFermer sans enregistrer ? Les changements seront perdus." : "Fermer l'éditeur ?";
            if (confirm(msg)) {
                // Restaurer l'état sauvegardé pour ne pas afficher des modifs fantômes à la réouverture (B9)
                if (dirty > 0 && grapesjsDataInput.value) {
                    try { editorInstance.loadProjectData(JSON.parse(grapesjsDataInput.value)); } catch(e) {}
                }
                overlay.style.display = "none";
            }
        });
    }
    var openBtn = document.getElementById("open-editor-btn");
    if (openBtn) { openBtn.addEventListener("click", function(e) { e.preventDefault(); overlay.style.display = "block"; if (!editorInstance) { try { initEditor(); } catch(err) { console.error(err); alert("Erreur editeur"); } } }); }

    function openGallery(ed) {
        var modal = ed.Modal, pfx = ed.getConfig("stylePrefix");
        var list = [{k:"hero-alterne",n:"Héros Alterné"},{k:"grille-cartes",n:"Grille de Cartes"},{k:"magazine",n:"Magazine / Média"},{k:"jumbotron",n:"Jumbotron Institutionnel"},{k:"chiffres-cles",n:"Chiffres Clés"},{k:"texte-academique",n:"Texte Académique"},{k:"split-screen",n:"Split Écran 50/50"},{k:"faq",n:"FAQ / Accordéon"},{k:"liste-documents",n:"Liste de Documents"},{k:"onglets",n:"Onglets de Contenu"},{k:"etapes",n:"Étapes / Processus"},{k:"profils",n:"Grille de Profils"},{k:"visuel-texte",n:"Visuel + Texte"},{k:"cartes-escalier",n:"Cartes en Escalier"}];
        var perPage = 1, totalPages = Math.ceil(list.length/perPage);
        function G(k){var html=H(k);return U('<!DOCTYPE html><html><head><meta charset="UTF-8"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"><style>body{font-family:Inter,system-ui,sans-serif;margin:0;padding:0;transform:scale(0.55);transform-origin:top left;width:182%;}</style></head><body>'+html+'</body></html>');}
        function U(s){return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
        function H(k){return{
"hero-alterne":'<section class="py-5 hero-s1 hero-bg"><div class="container"><div class="row"><div class="col-12 text-center"><h1 class="display-4 font-weight-bold">Votre titre principal</h1><p class="lead mt-3 mx-auto" style="max-width:700px;color:#6b647a;">Un paragraphe d\'introduction qui présente votre service ou concept. Double-cliquez pour modifier ce texte.</p></div></div></div></section><section class="py-5 hero-s2"><div class="container"><div class="row align-items-center"><div class="col-md-6"><img src="https://placehold.co/600x400/d4845a/ffffff?text=Image+1" alt="Illustration" class="img-fluid rounded img-hero-1"></div><div class="col-md-6"><h2 class="font-weight-bold">Titre du premier bloc</h2><p class="text-secondary">Double-cliquez pour modifier ce paragraphe. Vous pouvez ajouter votre contenu ici.</p><a href="#" class="btn btn-lg font-weight-bold" style="background:#d4845a;color:#fff;">Action</a></div></div></div></section><section class="py-5 hero-s3 hero-bg"><div class="container"><div class="row align-items-center"><div class="col-md-6 order-2 order-md-1"><h2 class="font-weight-bold">Titre du second bloc</h2><p class="text-secondary">Double-cliquez pour modifier ce paragraphe. L\'ordre des colonnes est inversé visuellement.</p><a href="#" class="btn btn-lg font-weight-bold" style="background:#d4845a;color:#fff;">En savoir plus</a></div><div class="col-md-6 order-1 order-md-2"><img src="https://placehold.co/600x400/2d2540/ffffff?text=Image+2" alt="Illustration" class="img-fluid rounded img-hero-2"></div></div></div></section>',
"grille-cartes":'<section class="py-5"><div class="container"><div class="row"><div class="col-12 text-center mb-4"><h2 class="font-weight-bold">Actualités &amp; Ressources</h2><p class="text-secondary">Découvrez nos derniers articles et dossiers.</p></div></div><div class="row"><div class="col-md-4 mb-4"><div class="card card-g1"><img src="https://placehold.co/600x400/d4845a/ffffff?text=Article+1" class="card-img-top img-card-1" alt="Article 1"><div class="card-body"><h5 class="card-title font-weight-bold">Titre de l\'article</h5><p class="card-text text-secondary">Résumé court de l\'article. Double-cliquez pour modifier.</p><a href="#" class="btn btn-sm" style="background:#d4845a;color:#fff;">Lire la suite</a></div></div></div><div class="col-md-4 mb-4"><div class="card card-g2"><img src="https://placehold.co/600x400/2d2540/ffffff?text=Article+2" class="card-img-top img-card-2" alt="Article 2"><div class="card-body"><h5 class="card-title font-weight-bold">Titre de l\'article</h5><p class="card-text text-secondary">Résumé court de l\'article. Double-cliquez pour modifier.</p><a href="#" class="btn btn-sm" style="background:#d4845a;color:#fff;">Lire la suite</a></div></div></div><div class="col-md-4 mb-4"><div class="card card-g3"><img src="https://placehold.co/600x400/6b647a/ffffff?text=Article+3" class="card-img-top img-card-3" alt="Article 3"><div class="card-body"><h5 class="card-title font-weight-bold">Titre de l\'article</h5><p class="card-text text-secondary">Résumé court de l\'article. Double-cliquez pour modifier.</p><a href="#" class="btn btn-sm" style="background:#d4845a;color:#fff;">Lire la suite</a></div></div></div></div></div></section>',
"magazine":'<section class="py-5"><div class="container"><div class="row"><div class="col-md-8"><h1 class="font-weight-bold mb-3">Titre de l\'article principal</h1><img src="https://placehold.co/800x400/d4845a/ffffff?text=Image+principale" alt="Image principale" class="img-fluid rounded mb-3"><p class="text-muted small">Publié le 19 juillet 2026 — Par Auteur</p><p class="text-secondary">Double-cliquez pour modifier ce paragraphe. Lorem ipsum dolor sit amet.</p><p class="text-secondary">Second paragraphe de contenu.</p></div><div class="col-md-4"><div class="card mb-3" style="background-color:#f5f3f0"><div class="card-body"><h5 class="font-weight-bold">Rechercher</h5><div class="input-group"><input type="text" class="form-control" placeholder="Rechercher..."><div class="input-group-append"><button class="btn" style="background:#d4845a;color:#fff;">🔍</button></div></div></div></div><div class="list-group mb-3"><span class="list-group-item active font-weight-bold" style="background:#d4845a;border-color:#d4845a;">Articles récents</span><a href="#" class="list-group-item list-group-item-action">Article connexe 1</a><a href="#" class="list-group-item list-group-item-action">Article connexe 2</a></div><div class="card" style="background-color:#f5f3f0"><div class="card-body"><h5 class="font-weight-bold">À la une</h5><p class="card-text text-secondary small">Encadré de mise en avant.</p></div></div></div></div></div></section>',
"jumbotron":'<section class="jumbotron jumbotron-fluid mb-0" style="background-color:#f5f3f0"><div class="container text-center py-5"><h1 class="display-4 font-weight-bold">Bienvenue au CNCDP</h1><p class="lead mt-3 mx-auto" style="max-width:600px;color:#6b647a;">Instance indépendante chargée de veiller au respect du Code de déontologie des psychologues en France.</p><hr class="my-4 mx-auto" style="max-width:100px;border-top:3px solid #d4845a;"><div class="mt-4"><a href="#" class="btn btn-lg font-weight-bold mr-2 mb-2" style="background:#d4845a;color:#fff;">Action principale</a><a href="#" class="btn btn-lg btn-outline-secondary font-weight-bold mb-2">Action secondaire</a></div></div></section>',
"chiffres-cles":'<section class="py-5"><div class="container"><div class="row"><div class="col-12 text-center mb-4"><h2 class="font-weight-bold">Le CNCDP en chiffres</h2></div></div><div class="row"><div class="col-md-3 col-sm-6 text-center mb-3"><div class="display-3 font-weight-bold" style="color:#d4845a;">250+</div><h5 class="font-weight-bold mt-2">Avis rendus</h5><p class="text-secondary small">Depuis notre création</p></div><div class="col-md-3 col-sm-6 text-center mb-3"><div class="display-3 font-weight-bold" style="color:#d4845a;">15</div><h5 class="font-weight-bold mt-2">Organisations</h5><p class="text-secondary small">Adhérentes</p></div><div class="col-md-3 col-sm-6 text-center mb-3"><div class="display-3 font-weight-bold" style="color:#d4845a;">30+</div><h5 class="font-weight-bold mt-2">Experts</h5><p class="text-secondary small">Membres du comité</p></div><div class="col-md-3 col-sm-6 text-center mb-3"><div class="display-3 font-weight-bold" style="color:#d4845a;">100%</div><h5 class="font-weight-bold mt-2">Indépendance</h5><p class="text-secondary small">Garantie statutaire</p></div></div></div></section>',
"texte-academique":'<section class="py-5"><div class="container"><div class="row"><div class="col-lg-8 offset-lg-2"><h1 class="font-weight-bold mb-3">Titre de la page juridique</h1><p class="font-italic text-secondary mb-4">Sous-titre ou chapeau introductif en italique.</p><h2 class="font-weight-bold mt-5 mb-3">Section 1</h2><p class="text-secondary mb-4">Double-cliquez pour modifier ce paragraphe. Le texte est centré dans une colonne étroite pour un confort de lecture optimal.</p><h3 class="font-weight-bold mt-4 mb-2">Sous-section 1.1</h3><ul class="mb-4 text-secondary"><li class="mb-2">Premier point important à retenir.</li><li class="mb-2">Deuxième élément de la liste.</li></ul><h2 class="font-weight-bold mt-5 mb-3">Section 2</h2><p class="text-secondary mb-4">Nouvelle section du document.</p></div></div></div></section>',
"split-screen":'<section class="py-0"><div class="container-fluid p-0"><div class="row no-gutters"><div class="col-md-6"><div class="d-flex align-items-center justify-content-center h-100" style="min-height:400px;background:linear-gradient(135deg,#d4845a,#2d2540);"><div class="text-center text-white p-4"><i class="fa fa-users mb-3" style="font-size:4rem;"></i><h2 class="font-weight-bold">Rejoignez-nous</h2></div></div></div><div class="col-md-6"><div class="p-5 d-flex flex-column justify-content-center" style="min-height:400px;"><h3 class="font-weight-bold mb-3">Contactez le CNCDP</h3><p class="text-secondary mb-4">Une question ? Remplissez ce formulaire.</p><form><div class="form-group"><label class="font-weight-bold">Votre nom</label><input type="text" class="form-control" placeholder="Nom complet"></div><div class="form-group"><label class="font-weight-bold">Votre email</label><input type="email" class="form-control" placeholder="email@exemple.fr"></div><div class="form-group"><label class="font-weight-bold">Message</label><textarea class="form-control" rows="3" placeholder="Votre message..."></textarea></div><button type="submit" class="btn btn-lg font-weight-bold w-100" style="background:#d4845a;color:#fff;">Envoyer</button></form></div></div></div></div></section>',
"faq":'<section class="py-5"><div class="container"><div class="row"><div class="col-md-10 offset-md-1"><h2 class="text-center font-weight-bold mb-2">Questions Fréquentes</h2><p class="text-center text-secondary mb-5">Retrouvez les réponses aux questions les plus courantes.</p><div class="accordion" id="faqAccordion"><div class="card faq-1"><div class="card-header" id="faqH1"><h2 class="mb-0"><button class="btn btn-link btn-block text-left font-weight-bold" type="button" data-toggle="collapse" data-target="#faqC1" aria-expanded="true">Comment déposer une saisine ?</button></h2></div><div id="faqC1" class="collapse show" aria-labelledby="faqH1" data-parent="#faqAccordion"><div class="card-body text-secondary">Vous pouvez déposer une saisine en ligne via notre formulaire dédié.</div></div></div><div class="card faq-2"><div class="card-header" id="faqH2"><h2 class="mb-0"><button class="btn btn-link btn-block text-left font-weight-bold collapsed" type="button" data-toggle="collapse" data-target="#faqC2">Qui peut saisir le CNCDP ?</button></h2></div><div id="faqC2" class="collapse" aria-labelledby="faqH2" data-parent="#faqAccordion"><div class="card-body text-secondary">Tout psychologue, organisation ou particulier concerné.</div></div></div><div class="card faq-3"><div class="card-header" id="faqH3"><h2 class="mb-0"><button class="btn btn-link btn-block text-left font-weight-bold collapsed" type="button" data-toggle="collapse" data-target="#faqC3">Quels sont les délais de traitement ?</button></h2></div><div id="faqC3" class="collapse" aria-labelledby="faqH3" data-parent="#faqAccordion"><div class="card-body text-secondary">Les délais varient selon la complexité du dossier.</div></div></div></div></div></div></div></section>',
"liste-documents":'<section class="py-5"><div class="container"><div class="row"><div class="col-12"><h2 class="font-weight-bold mb-4">Documents à télécharger</h2><ul class="list-group"><li class="list-group-item d-flex justify-content-between align-items-center doc-1"><div><i class="fa fa-file-pdf mr-2" style="color:#d4845a;font-size:1.5rem;"></i><strong>Code de déontologie</strong><br><small class="text-secondary">PDF — 245 Ko</small></div><a href="#" class="btn btn-sm font-weight-bold" style="background:#d4845a;color:#fff;">Télécharger</a></li><li class="list-group-item d-flex justify-content-between align-items-center"><div><i class="fa fa-file-pdf mr-2" style="color:#d4845a;font-size:1.5rem;"></i><strong>doc-2"><div><i class="fa fa-file-pdf mr-2" style="color:#d4845a;font-size:1.5rem;"></i><strong>Rapport annuel 2025</strong><br><small class="text-secondary">PDF — 1.2 Mo</small></div><a href="#" class="btn btn-sm font-weight-bold" style="background:#d4845a;color:#fff;">Télécharger</a></li><li class="list-group-item d-flex justify-content-between align-items-center doc-3"><div><i class="fa fa-file-word mr-2" style="color:#d4845a;font-size:1.5rem;"></i><strong>Formulaire de saisine</strong><br><small class="text-secondary">DOCX — 85 Ko</small></div><a href="#" class="btn btn-sm font-weight-bold" style="background:#d4845a;color:#fff;">Télécharger</a></li></ul></div></div></div></section>',
"onglets":'<section class="py-5"><div class="container"><div class="row"><div class="col-12"><h2 class="text-center font-weight-bold mb-4">Nos services</h2><ul class="nav nav-tabs justify-content-center mb-0" id="tplTabs" role="tablist"><li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#tplTab1" role="tab">Consultation</a></li><li class="nav-item"><a class="nav-link" data-toggle="tab" href="#tplTab2" role="tab">Formation</a></li><li class="nav-item"><a class="nav-link" data-toggle="tab" href="#tplTab3" role="tab">Publication</a></li></ul><div class="tab-content border border-top-0 rounded-bottom p-4"><div class="tab-pane fade show active" id="tplTab1"><h4 class="font-weight-bold">Service de consultation</h4><p class="text-secondary">Décrivez votre service de consultation. Double-cliquez pour modifier.</p></div><div class="tab-pane fade" id="tplTab2"><h4 class="font-weight-bold">Service de formation</h4><p class="text-secondary">Décrivez votre offre de formation. Double-cliquez pour modifier.</p></div><div class="tab-pane fade" id="tplTab3"><h4 class="font-weight-bold">Publications</h4><p class="text-secondary">Présentez vos publications. Double-cliquez pour modifier.</p></div></div></div></div></div></section>',
"etapes":'<section class="py-5"><div class="container"><div class="row"><div class="col-12 text-center mb-5"><h2 class="font-weight-bold">Comment ça marche</h2><p class="text-secondary">Notre processus en 4 étapes</p></div></div><div class="row align-items-center mb-5"><div class="col-md-2 text-center"><span class="d-inline-flex align-items-center justify-content-center rounded-circle font-weight-bold" style="width:80px;height:80px;background:#d4845a;color:#fff;font-size:1.5rem;">01</span></div><div class="col-md-10"><h4 class="font-weight-bold">Dépôt de la saisine</h4><p class="text-secondary mb-0">Complétez le formulaire en ligne.</p></div></div><div class="row align-items-center mb-5"><div class="col-md-2 text-center"><span class="d-inline-flex align-items-center justify-content-center rounded-circle font-weight-bold" style="width:80px;height:80px;background:#d4845a;color:#fff;font-size:1.5rem;">02</span></div><div class="col-md-10"><h4 class="font-weight-bold">Instruction du dossier</h4><p class="text-secondary mb-0">Notre comité examine votre demande.</p></div></div><div class="row align-items-center mb-5"><div class="col-md-2 text-center"><span class="d-inline-flex align-items-center justify-content-center rounded-circle font-weight-bold" style="width:80px;height:80px;background:#d4845a;color:#fff;font-size:1.5rem;">03</span></div><div class="col-md-10"><h4 class="font-weight-bold">Délibération</h4><p class="text-secondary mb-0">Les experts rendent leur avis.</p></div></div><div class="row align-items-center"><div class="col-md-2 text-center"><span class="d-inline-flex align-items-center justify-content-center rounded-circle font-weight-bold" style="width:80px;height:80px;background:#d4845a;color:#fff;font-size:1.5rem;">04</span></div><div class="col-md-10"><h4 class="font-weight-bold">Publication de l\'avis</h4><p class="text-secondary mb-0">L\'avis est publié sur notre site.</p></div></div></div></section>',
"profils":'<section class="py-5"><div class="container"><div class="row"><div class="col-12 text-center mb-5"><h2 class="font-weight-bold">Notre équipe</h2><p class="text-secondary">Les membres du comité</p></div></div><div class="row"><div class="col-6 col-md-3 text-center mb-4 profil-1"><img src="https://placehold.co/200x200/d4845a/ffffff?text=Membre+1" alt="Photo" class="rounded-circle img-fluid mb-3 img-profil-1" style="max-width:150px;"><h5 class="font-weight-bold mb-1">Nom Prénom</h5><p class="text-muted small mb-2">Fonction / Titre</p><div><a href="#" class="text-secondary mx-1"><i class="fa fa-envelope"></i></a></div></div><div class="col-6 col-md-3 text-center mb-4 profil-2"><img src="https://placehold.co/200x200/2d2540/ffffff?text=Membre+2" alt="Photo" class="rounded-circle img-fluid mb-3 img-profil-2" style="max-width:150px;"><h5 class="font-weight-bold mb-1">Nom Prénom</h5><p class="text-muted small mb-2">Fonction / Titre</p><div><a href="#" class="text-secondary mx-1"><i class="fa fa-envelope"></i></a></div></div><div class="col-6 col-md-3 text-center mb-4 profil-3"><img src="https://placehold.co/200x200/6b647a/ffffff?text=Membre+3" alt="Photo" class="rounded-circle img-fluid mb-3 img-profil-3" style="max-width:150px;"><h5 class="font-weight-bold mb-1">Nom Prénom</h5><p class="text-muted small mb-2">Fonction / Titre</p><div><a href="#" class="text-secondary mx-1"><i class="fa fa-envelope"></i></a></div></div><div class="col-6 col-md-3 text-center mb-4 profil-4"><img src="https://placehold.co/200x200/d4845a/ffffff?text=Membre+4" alt="Photo" class="rounded-circle img-fluid mb-3 img-profil-4" style="max-width:150px;"><h5 class="font-weight-bold mb-1">Nom Prénom</h5><p class="text-muted small mb-2">Fonction / Titre</p><div><a href="#" class="text-secondary mx-1"><i class="fa fa-envelope"></i></a></div></div></div></div></section>',
"visuel-texte":'<section class="bg-white py-5"><div class="container px-md-5"><div class="row align-items-center"><div class="col-12 col-md-6 pr-md-5 mb-4 mb-md-0"><h1 class="display-4 font-weight-normal mb-5">Votre titre<br>sur deux lignes</h1><img src="https://placehold.co/600x700/d4845a/ffffff?text=Portrait" alt="Illustration" class="img-fluid"></div><div class="col-12 col-md-6 pl-md-5" style="border-left:1px solid #e5e0d8;"><p class="lead text-secondary mb-3">Un paragraphe descriptif présentant votre mission, votre service ou votre organisation. Double-cliquez pour modifier ce texte et le personnaliser selon vos besoins.</p><p class="small text-muted mb-4">Image by Freepik</p><a href="#" class="btn btn-dark rounded-lg font-weight-bold px-4 py-2">En savoir plus</a></div></div></div></section>',
"cartes-escalier":'<section class="py-5" style="background-color:#f5f3f0" style="position:relative;overflow:hidden;"><div style="position:absolute;top:50%;left:0;right:0;height:120px;background-color:#d4845a;transform:translateY(-50%);z-index:0;"></div><div class="container" style="position:relative;z-index:1;"><div class="row"><div class="col-12 text-center mb-5"><h2 class="font-weight-bold mb-3">Notre processus</h2><p class="text-secondary">Découvrez nos étapes clés.</p></div></div><div class="row"><div class="col-12 col-md-4 mb-4"><div class="card border-0 shadow-lg text-center card-ce1"><div class="card-body p-4"><img src="https://placehold.co/600x400/d4845a/ffffff?text=Étape+1" alt="Étape 1" class="img-fluid rounded mb-3 img-step-1"><h4 class="font-weight-bold">Étape 1</h4><p class="text-muted small">Description courte de cette première étape du processus.</p><a href="#" class="text-dark font-weight-bold"><u>MORE</u></a></div></div></div><div class="col-12 col-md-4 mb-4 mt-md-5"><div class="card border-0 shadow-lg text-center card-ce2"><div class="card-body p-4"><img src="https://placehold.co/600x400/2d2540/ffffff?text=Étape+2" alt="Étape 2" class="img-fluid rounded mb-3 img-step-2"><h4 class="font-weight-bold">Étape 2</h4><p class="text-muted small">Description courte de cette deuxième étape du processus.</p><a href="#" class="text-dark font-weight-bold"><u>MORE</u></a></div></div></div><div class="col-12 col-md-4 mb-4 mt-md-5 pt-md-5"><div class="card border-0 shadow-lg text-center card-ce3"><div class="card-body p-4"><img src="https://placehold.co/600x400/6b647a/ffffff?text=Étape+3" alt="Étape 3" class="img-fluid rounded mb-3 img-step-3"><h4 class="font-weight-bold">Étape 3</h4><p class="text-muted small">Description courte de cette troisième étape du processus.</p><a href="#" class="text-dark font-weight-bold"><u>MORE</u></a></div></div></div></div></div></section>'
}[k]||"";}
        function renderPage(page) {
            var slice = list.slice(page*perPage, page*perPage+perPage);
            var cards = slice.map(function(t){return '<div class="tpl-card" data-key="'+t.k+'" style="border:3px solid #e2dce8;border-radius:0.75rem;overflow:hidden;cursor:pointer;transition:all 0.2s;background:#fff;width:100%;box-sizing:border-box;margin-bottom:0.5rem;"><div style="height:500px;overflow:hidden;border-bottom:1px solid #e2dce8;pointer-events:none;"><iframe srcdoc="'+G(t.k)+'" style="width:100%;height:500px;border:none;display:block;"></iframe></div><div style="padding:0.8rem 1rem;text-align:center;"><strong style="font-size:1rem;">'+t.n+'</strong></div></div>';}).join("");
            var nav = ""; if(totalPages>1){nav='<div style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:10;">'+(page>0?'<button id="tpl-prev" style="position:absolute;left:0.5rem;top:50%;transform:translateY(-50%);pointer-events:auto;background:#2d2540;color:#fff;border:none;border-radius:50%;width:3rem;height:3rem;font-size:1.5rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);">\u2039</button>':"")+(page<totalPages-1?'<button id="tpl-next" style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);pointer-events:auto;background:#2d2540;color:#fff;border:none;border-radius:50%;width:3rem;height:3rem;font-size:1.5rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);">\u203a</button>':"")+"</div>";}
            var h = '<div style="position:relative;">'+nav+'<div style="display:flex;flex-direction:column;gap:0.5rem;">'+cards+'</div>'+(totalPages>1?'<div style="text-align:center;margin-top:0.75rem;font-size:0.9rem;color:#6b647a;"><strong>'+(page+1)+' / '+totalPages+'</strong></div>':'')+'<div style="margin-top:0.75rem;text-align:right;border-top:1px solid #e2dce8;padding-top:0.75rem;"><button class="'+pfx+'btn-prim" id="tpl-apply-btn" disabled style="opacity:0.4;">Selectionnez un template</button></div>';
            var w = document.createElement("div"); w.innerHTML = h;
            var cs = w.querySelectorAll(".tpl-card"), ab = w.querySelector("#tpl-apply-btn");
            cs.forEach(function(c){c.addEventListener("click",function(){cs.forEach(function(x){x.style.borderColor="#e2dce8";x.style.boxShadow="none";x.style.transform="none";});c.style.borderColor="#d4845a";c.style.boxShadow="0 0 0 4px rgba(212,132,90,0.3)";c.style.transform="scale(1.03)";ab.disabled=false;ab.style.opacity="1";ab.textContent="Appliquer : "+c.querySelector("strong").textContent;ab.setAttribute("data-key",c.dataset.key);});});
            ab.addEventListener("click",function(){var k=ab.getAttribute("data-key");if(k){var html=H(k);ed.setComponents(html);modal.close();}});
            var pb=w.querySelector("#tpl-prev"),nb=w.querySelector("#tpl-next");
            if(pb) pb.addEventListener("click",function(){modal.setContent(renderPage(page-1));});
            if(nb) nb.addEventListener("click",function(){modal.setContent(renderPage(page+1));});
            return w;
        }
        modal.setTitle("Galerie de templates"); modal.setContent(renderPage(0)); modal.open();
    }
    window.__cncdp_templates_ready = true;
});
