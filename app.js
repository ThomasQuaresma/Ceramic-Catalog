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
    grid.innerHTML = ''; 
    
    produtos.forEach((produto, index) => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        const urlImagem = produto.imagem || 'https://via.placeholder.com/300x400.png';
        const urlModelo3D = produto.modelo3d || './modelo.glb';
        
        // Transformamos o objeto produto em uma string segura para poder passar no clique do botão
        const produtoString = JSON.stringify(produto).replace(/"/g, '&quot;');
        
        card.innerHTML = `
            <div class="product-image-wrapper" style="background-color: #f5f5f5;">
                <model-viewer 
                    src="${urlModelo3D}" 
                    poster="${urlImagem}" 
                    alt="Modelo 3D de ${produto.titulo}" 
                    shadow-intensity="1" 
                    camera-controls 
                    auto-rotate 
                    ar 
                    ar-modes="webxr scene-viewer quick-look" 
                    ar-scale="fixed"
                    loading="lazy" 
                    style="width: 100%; height: 100%; outline: none;"
                >
                    <button slot="ar-button" class="custom-ar-button-grid">
                        📸 Projetar
                    </button>
                </model-viewer>
            </div>
            <h3 class="product-title">${produto.titulo}</h3>
            <p class="product-material">${produto.material}</p>
            <button class="btn-detalhes" onclick='abrirModal(${produtoString})'>Ver Detalhes</button>
        `;
        
        grid.appendChild(card);
    });
}

function configurarFiltros() {
    const botoes = document.querySelectorAll('.btn-filtro');
    
    botoes.forEach(botao => {
        botao.addEventListener('click', (evento) => {
            botoes.forEach(b => b.classList.remove('ativo'));
            evento.target.classList.add('ativo');
            
            const categoriaEscolhida = evento.target.getAttribute('data-categoria');
            
            if (categoriaEscolhida === 'todos') {
                renderizarCatalogo(bancoDeDadosGlobal);
            } else {
                const filtrados = bancoDeDadosGlobal.filter(p => p.categoria === categoriaEscolhida);
                renderizarCatalogo(filtrados);
            }
        });
    });
}

function abrirModal(produto) {
    const modal = document.getElementById('produto-modal');
    
    document.getElementById('modal-titulo').textContent = produto.titulo;
    document.getElementById('modal-descricao').textContent = produto.material;
    
    let specsHTML = '';
    if (produto.volume) specsHTML += `<li><strong>Volume:</strong> ${produto.volume}</li>`;
    if (produto.dimensoes) specsHTML += `<li><strong>Dimensões:</strong> ${produto.dimensoes}</li>`;
    document.getElementById('modal-specs').innerHTML = specsHTML;
    
    const btnWhats = document.getElementById('modal-whatsapp');
    btnWhats.href = `https://wa.me/SEUNUMERO?text=Olá, quero fechar pedido do modelo ${produto.titulo}.`;
    
    // CAPTURA O COMPONENTE JÁ EXISTENTE NO HTML
    const viewer = document.getElementById('visualizador-3d');
    
    // DEFINE OS CAMINHOS LOCAIS
    // Se o produto tiver a propriedade 'modelo3d' no JSON, ele usa ela. 
    // Caso contrário, cai no arquivo padrão './modelo.glb' que está na raiz.
    const urlModelo3D = produto.modelo3d || './modelo.glb'; 
    const urlImagemPoster = produto.imagem || 'https://via.placeholder.com/1000x1200.png';
    
    // APENAS ATUALIZA OS ATRIBUTOS (Preserva o mapeamento de cliques do navegador)
    viewer.src = urlModelo3D;
    viewer.poster = urlImagemPoster;
    
    modal.style.display = 'flex';
}

function configurarModal() {
    const modal = document.getElementById('produto-modal');
    const btnFechar = document.getElementById('btn-fechar');

    btnFechar.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}