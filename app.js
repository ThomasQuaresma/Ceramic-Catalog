let bancoDeDadosGlobal = [];

// ─── NÚMERO DO WHATSAPP (edite aqui) ───────────────────────────────────────
const WHATSAPP_NUMBER = '5511999999999'; // formato: código do país + DDD + número

document.addEventListener('DOMContentLoaded', () => {
    fetch('produtos.json')
        .then(r => r.json())
        .then(dados => {
            // Remove duplicatas pelo id
            const unicos = [];
            const vistos = new Set();
            dados.forEach(p => {
                if (!vistos.has(p.id)) { vistos.add(p.id); unicos.push(p); }
            });
            bancoDeDadosGlobal = unicos;
            renderizarCatalogo(unicos);
            configurarFiltros();
            configurarModal();
        })
        .catch(e => console.error('Erro ao carregar produtos:', e));
});

const LABEL_CATEGORIA = {
    rustico:  'Linha Rústica',
    moderno:  'Design Moderno',
    organico: 'Formas Orgânicas'
};

// ─── VITRINE ────────────────────────────────────────────────────────────────
// Na vitrine todos os cards usam IMAGEM simples + badge informativo.
// Só o produto com modelo3d mostra o badge "3D · AR".
// O model-viewer fica APENAS no modal.

function renderizarCatalogo(produtos) {
    const grid = document.getElementById('grid-vitrine');
    grid.innerHTML = '';

    produtos.forEach((produto, index) => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.04}s`;

        const urlImagem = produto.imagem || 'https://via.placeholder.com/600x800.png';
        const catLabel  = LABEL_CATEGORIA[produto.categoria] || produto.categoria;
        const tem3D     = !!produto.modelo3d;
        const produtoStr = JSON.stringify(produto).replace(/"/g, '&quot;');

        const badgeHTML = tem3D
            ? `<span class="badge-3d">✦ 3D · AR</span>`
            : `<span class="badge-zoom">🔍 Zoom</span>`;

        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${urlImagem}" 
                     alt="${produto.titulo}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/600x800.png'">
                ${badgeHTML}
            </div>
            <div class="product-info">
                <span class="product-category-tag">${catLabel}</span>
                <h3 class="product-title">${produto.titulo}</h3>
                <p class="product-material">${produto.material}</p>
                <button class="btn-detalhes" onclick='abrirModal(${produtoStr})'>Ver detalhes</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

// ─── FILTROS ────────────────────────────────────────────────────────────────
function configurarFiltros() {
    document.querySelectorAll('.btn-filtro').forEach(botao => {
        botao.addEventListener('click', e => {
            document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');
            const cat = e.target.dataset.categoria;
            renderizarCatalogo(cat === 'todos' ? bancoDeDadosGlobal
                : bancoDeDadosGlobal.filter(p => p.categoria === cat));
        });
    });
}

// ─── MODAL ──────────────────────────────────────────────────────────────────
function abrirModal(produto) {
    const modal    = document.getElementById('produto-modal');
    const catLabel = LABEL_CATEGORIA[produto.categoria] || produto.categoria;
    const tem3D    = !!produto.modelo3d;

    // Preenche textos
    document.getElementById('modal-categoria').textContent = catLabel;
    document.getElementById('modal-titulo').textContent    = produto.titulo;
    document.getElementById('modal-descricao').textContent = produto.material;

    let specsHTML = '';
    if (produto.volume)   specsHTML += `<li><strong>Volume</strong>${produto.volume}</li>`;
    if (produto.dimensoes) specsHTML += `<li><strong>Dimensões</strong>${produto.dimensoes}</li>`;
    document.getElementById('modal-specs').innerHTML = specsHTML;

    // WhatsApp — mensagem estruturada
    const specs = [
        produto.volume    ? `📦 Volume: ${produto.volume}`     : '',
        produto.dimensoes ? `📐 Dimensões: ${produto.dimensoes}` : '',
    ].filter(Boolean).join('\n');

    const msgWpp = encodeURIComponent(
        `Olá! Vi o catálogo do Estúdio Cerâmica e tenho interesse na peça:\n\n` +
        `*${produto.titulo}*\n` +
        `_${produto.material}_\n` +
        (specs ? `\n${specs}\n` : '') +
        `\nPoderia me informar disponibilidade e valor? Obrigado(a)!`
    );
    document.getElementById('modal-whatsapp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msgWpp}`;

    // Área visual: 3D ou zoom foto
    renderizarAreaVisual(produto, tem3D);

    modal.style.display = 'flex';
}

function renderizarAreaVisual(produto, tem3D) {
    const container = document.getElementById('ar-container');

    if (tem3D) {
        // ── MODO 3D + AR ──────────────────────────────────────────────────
        container.innerHTML = `
            <model-viewer
                id="visualizador-3d"
                src="${produto.modelo3d}"
                poster="${produto.imagem || ''}"
                alt="Modelo 3D de ${produto.titulo}"
                shadow-intensity="1"
                camera-controls
                auto-rotate
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="fixed"
                style="width:100%;height:100%;outline:none;"
            >
                <button slot="ar-button" class="custom-ar-button">
                    📐 Ver no meu ambiente
                </button>
            </model-viewer>
            <div class="modal-media-label">3D interativo — arraste para girar</div>
        `;
    } else {
        // ── MODO ZOOM FOTO ────────────────────────────────────────────────
        const urlImagem = produto.imagem || 'https://via.placeholder.com/1000x1200.png';
        container.innerHTML = `
            <div class="zoom-wrapper" id="zoom-wrapper">
                <img id="zoom-img"
                     src="${urlImagem}"
                     alt="${produto.titulo}"
                     draggable="false">
            </div>
            <div class="zoom-controls">
                <button class="zoom-btn" id="btn-zoom-in"  title="Aproximar">＋</button>
                <button class="zoom-btn" id="btn-zoom-out" title="Afastar">－</button>
                <button class="zoom-btn" id="btn-zoom-rst" title="Resetar">⊙</button>
            </div>
            <div class="modal-media-label">Foto — use os botões ou pinça para detalhar</div>
        `;
        iniciarZoom();
    }
}

// ─── ZOOM FOTO ───────────────────────────────────────────────────────────────
function iniciarZoom() {
    const wrapper = document.getElementById('zoom-wrapper');
    const img     = document.getElementById('zoom-img');
    let escala = 1, origemX = 50, origemY = 50;
    let arrastando = false, startX, startY, transX = 0, transY = 0, lastTX = 0, lastTY = 0;

    function aplicar(s, ox, oy, tx, ty) {
        escala = Math.min(Math.max(s, 1), 4);
        transX = tx; transY = ty;
        img.style.transformOrigin = `${ox}% ${oy}%`;
        img.style.transform = `scale(${escala}) translate(${tx}px, ${ty}px)`;
        wrapper.style.cursor = escala > 1 ? 'grab' : 'zoom-in';
    }

    // Botões
    document.getElementById('btn-zoom-in').addEventListener('click',  () => aplicar(escala + 0.5, 50, 50, transX, transY));
    document.getElementById('btn-zoom-out').addEventListener('click', () => aplicar(escala - 0.5, 50, 50, escala <= 1.5 ? 0 : transX, escala <= 1.5 ? 0 : transY));
    document.getElementById('btn-zoom-rst').addEventListener('click', () => aplicar(1, 50, 50, 0, 0));

    // Click para zoom ponto
    img.addEventListener('click', e => {
        if (arrastando) return;
        const rect = wrapper.getBoundingClientRect();
        const ox = ((e.clientX - rect.left) / rect.width)  * 100;
        const oy = ((e.clientY - rect.top)  / rect.height) * 100;
        aplicar(escala < 2 ? 2 : 1, ox, oy, 0, 0);
    });

    // Arrasto mouse
    img.addEventListener('mousedown', e => { arrastando = false; startX = e.clientX - lastTX; startY = e.clientY - lastTY; wrapper.style.cursor = 'grabbing'; });
    window.addEventListener('mousemove', e => {
        if (e.buttons !== 1 || escala <= 1) return;
        arrastando = true;
        aplicar(escala, origemX, origemY, e.clientX - startX, e.clientY - startY);
        lastTX = transX; lastTY = transY;
    });
    window.addEventListener('mouseup', () => { wrapper.style.cursor = escala > 1 ? 'grab' : 'zoom-in'; });

    // Touch pinça
    let toque0, toque1, escalaInicial;
    wrapper.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            toque0 = e.touches[0]; toque1 = e.touches[1];
            escalaInicial = escala;
        }
    }, { passive: true });
    wrapper.addEventListener('touchmove', e => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dist0 = Math.hypot(toque0.clientX - toque1.clientX, toque0.clientY - toque1.clientY);
            const dist1 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            aplicar(escalaInicial * (dist1 / dist0), 50, 50, transX, transY);
        }
    }, { passive: false });
}

// ─── CONFIGURAR MODAL ────────────────────────────────────────────────────────
function configurarModal() {
    const modal    = document.getElementById('produto-modal');
    const btnFechar = document.getElementById('btn-fechar');

    btnFechar.addEventListener('click', fecharModal);
    modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });
}

function fecharModal() {
    const modal = document.getElementById('produto-modal');
    modal.style.display = 'none';
    // Limpa o container para parar o auto-rotate do model-viewer
    document.getElementById('ar-container').innerHTML = '';
}