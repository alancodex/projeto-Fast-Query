import { useState } from 'react'
import Select from 'react-select'
import axios from 'axios'

function App() {
  const [servidor, setServidor] = useState('')
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [bancos, setBancos] = useState([])
  const [bancoSelecionado, setBancoSelecionado] = useState(null)
  const [query, setQuery] = useState('')
  const [tabela, setTabela] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)

  const BASE_URL = 'https://back-fast-query.onrender.com'

  const conectar = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/conectar`, {
        servidor,
        usuario,
        senha
      })
      if (res.data.success) {
        const lista = res.data.bancos || []
        setBancos(lista.map((banco) => ({ value: banco, label: banco })))
        setBancoSelecionado(lista.length > 0 ? { value: lista[0], label: lista[0] } : null)
        setErro(null)
      } else {
        setErro(res.data.error)
        setBancos([])
        setBancoSelecionado(null)
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor')
    }
  }

  const executar = async () => {
    if (!bancoSelecionado) return setErro('Selecione um banco de dados')
    try {
      const res = await axios.post(`${BASE_URL}/query`, {
        servidor,
        usuario,
        senha,
        banco: bancoSelecionado.value,
        query
      })
      if (res.data.success) {
        setResultado(res.data)
        setErro(null)
      } else {
        setErro(res.data.error)
        setResultado(null)
      }
    } catch {
      setErro('Erro ao executar a query')
    }
  }

const preview = async () => {
  if (!bancoSelecionado) return setErro('Selecione um banco de dados')

  try {
    const res = await axios.post(`${BASE_URL}/preview`, {
      servidor,
      usuario,
      senha,
      banco: bancoSelecionado.value,
      query
    })
    if (res.data.success) {
      setResultado(res.data)
      setErro(null)
    } else {
      setErro(res.data.error)
      setResultado(null)
    }
  } catch {
    setErro('Erro ao executar pré-visualização')
  }
}


  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: 'black',
      backgroundColor: state.isFocused ? '#eee' : 'white',
    }),
    singleValue: (provided) => ({ ...provided, color: 'black' }),
    input: (provided) => ({ ...provided, color: 'black' }),
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>FastQuery - Painel SQL Server</h1>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Servidor (ex: localhost\\SQLEXPRESS)"
          value={servidor}
          onChange={(e) => setServidor(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button onClick={conectar} style={{ marginLeft: 10 }}>Conectar</button>
      </div>

      {bancos.length > 0 && (
        <div style={{ marginTop: 10, width: 400 }}>
          <label>Banco:</label>
          <Select
            options={bancos}
            value={bancoSelecionado}
            onChange={(opcao) => setBancoSelecionado(opcao)}
            placeholder="Escolha ou pesquise um banco..."
            isSearchable
            styles={customStyles}
          />
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <textarea
          rows={5}
          cols={80}
          value={query}
          placeholder="Escreva sua query SQL aqui..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <br />
        <br />
        <button onClick={preview} style={{ marginTop: 10 }}>Pré-Visualizar Query</button>
        <button onClick={executar} style={{ marginTop: 10, marginLeft: 10 }}>Executar Query</button>
      </div>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {resultado?.columns && (
        <table border="1" cellPadding="5" style={{ marginTop: 20, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {resultado.columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resultado.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {resultado?.message && (
        <p style={{ marginTop: 10 }}>{resultado.message}</p>
      )}
    </div>
  )
}

export default App
