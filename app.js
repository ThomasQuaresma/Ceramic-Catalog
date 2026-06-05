let bancoDeDadosGlobal = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('produtos.json')
        .then(resposta => resposta.json())
        .then(dados => {
            bancoDeDadosGlobal = dados;
            renderizarCatalogo(dados);
            configurarFiltros();
            configurarModal();
        })
        .catch(erro => console.error('Erro ao carregar o catálogo:', erro));
});

function renderizarCatalogo(produtos) {
    const grid = document.getElementById('grid-vitrine');
    grid.innerHTML = ''; // Limpa a grade antes de desenhar os filtrados
    
    produtos.forEach((produto, index) => {
        const card = document.createElement('article');
        card.className = 'product-card';
        // Atraso sutil em cascata para a animação de cada cartão
        card.style.animationDelay = `${index * 0.05}s`;
        
        const urlImagem = produto.imagem || 'https://via.placeholder.com/300x400.png';
        
        card.innerHTML = `
            <div class="product-image-wrapper" style="background-image: url('${urlImagem}'); background-size: cover; background-position: center;">
                <span class="zoom-badge">Ver Detalhes</span>
            </div>
            <h3 class="product-title">${produto.titulo}</h3>
            <p class="product-material">${produto.material}</p>
        `;
        
        card.addEventListener('click', () => abrirModal(produto));
        grid.appendChild(card);
    });
}

function configurarFiltros() {
    const botoes = document.querySelectorAll('.btn-filtro');
    
    botoes.forEach(botao => {
        botao.addEventListener('click', (evento) => {
            // Remove a classe ativa de todos os botões e adiciona no clicado
            botoes.forEach(b => b.classList.remove('ativo'));
            evento.target.classList.add('ativo');
            
            const categoriaEscolhida = evento.target.getAttribute('data-categoria');
            
            if (categoriaEscolhida === 'todos') {
                renderizarCatalogo(bancoDeDadosGlobal);
            } else {
                // Filtra o banco de dados buscando produtos com a categoria exata
                const filtrados = bancoDeDadosGlobal.filter(p => p.categoria === categoriaEscolhida);
                renderizarCatalogo(filtrados);
            }
        });
    });
}
function abrirModal(produto) {
    const modal = document.getElementById('produto-modal');
    const zoomContainer = document.getElementById('zoom-container');
    
    document.getElementById('modal-titulo').textContent = produto.titulo;
    document.getElementById('modal-descricao').textContent = produto.material;
    
    let specsHTML = '';
    if (produto.volume) specsHTML += `<li><strong>Volume:</strong> ${produto.volume}</li>`;
    if (produto.dimensoes) specsHTML += `<li><strong>Dimensões:</strong> ${produto.dimensoes}</li>`;
    document.getElementById('modal-specs').innerHTML = specsHTML;
    
    const btnWhats = document.getElementById('modal-whatsapp');
    btnWhats.href = `https://wa.me/SEUNUMERO?text=Olá, quero fechar pedido do modelo ${produto.titulo}.`;
    
    // Limpa a imagem estática para preparar o contêiner
    zoomContainer.innerHTML = '';
    zoomContainer.style.backgroundImage = 'none';
    
    // Arquivo 3D provisório mantido no servidor do Google para teste de câmera
    const urlModelo3D = "https://modelviewer.dev/shared-assets/models/Shoe.glb";
    const urlImagemPoster = produto.imagem || 'https://via.placeholder.com/1000x1200.png';
    
    // Injeção do componente de Realidade Aumentada
    zoomContainer.innerHTML = `
        <model-viewer 
            src="${urlModelo3D}" 
            poster="${urlImagemPoster}" 
            alt="Modelo 3D interativo do vaso" 
            shadow-intensity="1" 
            camera-controls 
            auto-rotate 
            ar 
            ar-modes="webxr scene-viewer quick-look" 
            ar-scale="fixed" 
            style="width: 100%; height: 100%; background-color: var(--img-placeholder);"
        >
            <button slot="ar-button" style="position: absolute; bottom: 20px; right: 20px; background-color: var(--brand-dark); color: white; border: none; padding: 10px 20px; border-radius: 30px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Projetar no Ambiente
            </button>
        </model-viewer>
    `;
    
    modal.style.display = 'flex';
}

function configurarModal() {
    const modal = document.getElementById('produto-modal');
    const btnFechar = document.getElementById('btn-fechar');

    // Fechamento manual e cliques fora do contêiner
    btnFechar.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // A lógica matemática do zoom foi removida porque o <model-viewer> 
    // já gerencia a rotação e aproximação do objeto nativamente.
}