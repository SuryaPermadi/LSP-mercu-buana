/**
 * Data Management for Certification Schemes
 * Fetching from Node.js Backend API
 */

const API_URL = 'http://localhost:3000/api';

async function getSchemes() {
    try {
        const response = await fetch(`${API_URL}/schemes`);
        return await response.json();
    } catch (err) {
        console.error('Failed to fetch schemes:', err);
        return [];
    }
}

async function addScheme(scheme) {
    const token = localStorage.getItem('lsp_admin_token');
    const response = await fetch(`${API_URL}/schemes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheme)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to add scheme');
    }
    return await response.json();
}

async function updateScheme(id, updatedScheme) {
    const token = localStorage.getItem('lsp_admin_token');
    const response = await fetch(`${API_URL}/schemes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedScheme)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update scheme');
    }
    return await response.json();
}

async function deleteScheme(id) {
    const token = localStorage.getItem('lsp_admin_token');
    const response = await fetch(`${API_URL}/schemes/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete scheme');
    }
}

async function bulkDeleteSchemes(ids) {
    const token = localStorage.getItem('lsp_admin_token');
    const response = await fetch(`${API_URL}/schemes/bulk-delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete schemes');
    }
    return await response.json();
}

async function loginAdmin(username, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed');
    }

    const { token } = await response.json();
    localStorage.setItem('lsp_admin_token', token);
    return token;
}

function logoutAdmin() {
    localStorage.removeItem('lsp_admin_token');
    window.location.href = 'login.html';
}

function isLoggedIn() {
    return !!localStorage.getItem('lsp_admin_token');
}

async function renderTable(tableBodyId, isAdmin = false) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    const schemes = await getSchemes();
    tbody.innerHTML = '';

    schemes.forEach((scheme, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            ${isAdmin ? `<td><input type="checkbox" class="row-checkbox" value="${scheme.id}" onchange="toggleBulkActionBtn()"></td>` : ''}
            <td>${index + 1}</td>
            <td>${scheme.name}</td>
            <td>${scheme.faculty}</td>
            <td>${scheme.program}</td>
            <td>
                ${isAdmin ? `
                    <button class="btn btn-secondary" onclick="editItem(${scheme.id})" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem(${scheme.id})" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background-color: #ff4d4d; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️ Hapus</button>
                ` : `
                   <!-- Public view handled by renderPublicSchemes now -->
                `}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function renderPublicSchemes(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const schemes = await getSchemes();
    container.innerHTML = '';

    // Group by Faculty
    const grouped = schemes.reduce((acc, scheme) => {
        const faculty = scheme.faculty || 'Lainnya';
        if (!acc[faculty]) acc[faculty] = [];
        acc[faculty].push(scheme);
        return acc;
    }, {});

    // Render tables for each faculty
    // Order: Ilmu Komunikasi, Ilmu Komputer, Desain Seni Kreatif, Ekonomi Bisnis, Teknik, Psikologi
    const priorityOrder = [
        'Ilmu Komunikasi',
        'Ilmu Komputer',
        'Desain Seni Kreatif',
        'Ekonomi dan Bisnis',
        'Teknik',
        'Psikologi'
    ];

    // Merge priority keys with others found in data
    const allKeys = [...new Set([...priorityOrder, ...Object.keys(grouped)])];

    allKeys.forEach((faculty, index) => {
        if (!grouped[faculty]) return;

        // Accordion Details
        const details = document.createElement('details');
        details.className = 'faculty-accordion';
        // Open the first one by default
        if (index === 0) details.open = true;

        // Summary (Header) - With Icon
        const summary = document.createElement('summary');

        const iconSpan = document.createElement('span');
        iconSpan.style.display = 'flex';
        iconSpan.style.alignItems = 'center';
        iconSpan.style.gap = '0.75rem';
        iconSpan.innerHTML = `<span style="font-size: 1.5rem;">🏛️</span> ${faculty}`;

        summary.appendChild(iconSpan);
        details.appendChild(summary);

        // Content Wrapper
        const contentDiv = document.createElement('div');
        contentDiv.className = 'faculty-content';

        // Table Container within content
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.style.boxShadow = 'none'; // Remove double shadow
        tableContainer.style.border = 'none';
        tableContainer.style.margin = '0';

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="width: 50px;">No</th>
                    <th>Skema Sertifikasi</th>
                    <th>Program Studi</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${grouped[faculty].map((scheme, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${scheme.name}</td>
                        <td>${scheme.program}</td>
                        <td>
                            <a href="${scheme.downloadAlert || '#'}" 
                               target="_blank"
                               class="btn btn-primary" 
                               style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                                ⬇️ Download APL
                            </a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        tableContainer.appendChild(table);
        contentDiv.appendChild(tableContainer);
        details.appendChild(contentDiv);

        container.appendChild(details);
    });
}
