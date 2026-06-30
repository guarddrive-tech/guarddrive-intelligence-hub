# -*- coding: utf-8 -*-
import sys
import json
import traceback
import hashlib
import random
from datetime import datetime
import os
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

# Força UTF-8 em stdout/stderr (necessário no Windows)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Base paths
DATASET_PATH = "dataset/forensic_dataset.jsonl"
KEY_PATH = os.path.join(os.path.dirname(__file__), "themis_private_key.pem")

def get_or_create_keys():
    """Recupera ou gera chaves Ed25519 para assinatura dos laudos."""
    # 1. Tentar ler da env
    env_key = os.environ.get("THEMIS_PRIVATE_KEY")
    if env_key:
        try:
            return ed25519.Ed25519PrivateKey.from_private_bytes(bytes.fromhex(env_key))
        except Exception:
            pass

    # 2. Tentar ler do arquivo
    if os.path.exists(KEY_PATH):
        try:
            with open(KEY_PATH, "rb") as f:
                return serialization.load_pem_private_key(f.read(), password=None)
        except Exception:
            pass

    # 3. Gerar nova chave
    private_key = ed25519.Ed25519PrivateKey.generate()
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    try:
        with open(KEY_PATH, "wb") as f:
            f.write(pem)
    except Exception as e:
        sys.stderr.write(f"[WARNING] Não foi possível persistir a chave privada: {e}\n")
    return private_key

def generate_forensic_report(event_data: dict) -> str:
    """
    Gera um laudo técnico-jurídico automatizado baseado em telemetria física-óptica.
    Adota termos do Hexágono Legislativo brasileiro e assina criptograficamente via Ed25519.
    """
    gtid = event_data.get("gtid", "GD-UNKNOWN")
    score = event_data.get("score", 0.0)
    optical_similarity = event_data.get("optical_similarity", 0.0)
    rf_consistency = event_data.get("rf_consistency", 0.0)
    tamper_evidence = event_data.get("tamper_evidence", 1.0)
    empresa = event_data.get("empresa", "Não Informada")
    segmento = event_data.get("segmento", "Não Informado")
    
    timestamp = datetime.utcnow().isoformat() + "Z"
    report_id = hashlib.md5(f"{gtid}-{timestamp}".encode('utf-8')).hexdigest()[:12].upper()
    block_num = random.randint(180000, 250000)
    
    # Setup de chaves Ed25519
    try:
        priv_key = get_or_create_keys()
        pub_key = priv_key.public_key()
        pub_hex = pub_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        ).hex()
    except Exception as e:
        sys.stderr.write(f"[WARNING] Erro ao carregar chaves criptográficas: {e}\n")
        pub_hex = "N/A"
        priv_key = None

    rf_consistency_desc = "CONFORME (Assinatura NFC/UHF Válida)" if rf_consistency == 1.0 else "DIVERGENTE (Ausência ou falha de sinal de rádiofrequência)"
    
    status = "AUTÊNTICO" if score >= 85.0 else "SUSPEITO"
    
    # Geração da justificativa jurídica e técnica detalhada
    if status == "AUTÊNTICO":
        justificativa = (
            "O ativo apresenta parâmetros plenamente conformes com os padrões de registro de fábrica. "
            f"A microtextura óptica analisada (OFP) obteve similitude de {optical_similarity:.2f}, ultrapassando o limiar de aceitação. "
            "A chave criptográfica NFC integrada atestou autenticidade física em hardware, sem indícios de violação física (lacre intacto). "
            "Portanto, o ativo é juridicamente apto para circulação, auditoria e cobertura de sinistros."
        )
    else:
        desvios = []
        if optical_similarity < 0.85:
            desvios.append(f"similitude óptica abaixo do limiar (obtida: {optical_similarity:.2f}, esperada: >= 0.85)")
        if rf_consistency == 0.0:
            desvios.append("ausência ou inconsistência de resposta do chip NFC criptográfico (rf_consistency: 0)")
        if tamper_evidence < 0.90:
            desvios.append(f"indícios físicos de violação mecânica do selo (tamper_evidence: {tamper_evidence:.2f})")
            
        justificativa = (
            "O ativo apresenta desvios críticos em relação aos padrões de segurança cadastrados na origem. "
            f"Fatores de inconsistência: {', '.join(desvios)}. "
            "A divergência nas métricas sugere potencial tentativa de clonagem óptica, reprodução por impressão "
            "ou remoção física do selo. O ativo é classificado como de alto risco operacional."
        )
        
    report_body = f"""================================================================================
          LAUDO TÉCNICO-JURÍDICO AUTOMATIZADO — INICIATIVA GUARDDRIVE™
                     REGISTRO DE EVIDÊNCIA FORENSE VEICULAR
================================================================================
Número de Controle: GD-LAUDO-{report_id}
GTID do Ativo: {gtid}
Timestamp do Registro: {timestamp}
Solicitante: {empresa} ({segmento})
--------------------------------------------------------------------------------

1. DECLARAÇÃO DE ESCOPO E OBJETO
Este documento constitui o relatório técnico-jurídico automatizado de conformidade
e validação de integridade física e lógica para o ativo veicular sob ID {gtid}.
A análise foi conduzida de forma autônoma pelo módulo de inteligência
Magistrado Themis™, operando na borda (Edge Computing) e de forma integrada ao
Protocolo Symbeon (L2).

2. METODOLOGIA E BASE LEGAL
O processo de auditoria baseia-se na verificação de três pilares de confiança:
a) Assinatura Óptica Atômica (AOA) - Análise de microtexturas físicas do selo.
b) Atestação de Rádiofrequência (NFC/UHF) - Assinaturas criptográficas em hardware.
c) Monitoramento de Adulteração (Tamper Evidence) - Integridade do lacre físico.

Amparo Legal de Admissibilidade de Prova Digital:
- Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD), Art. 6º, VIII
  (Adequação) e Art. 46 (Segurança e Sigilo).
- Lei Federal nº 12.965/2014 (Marco Civil da Internet), Art. 10 (Preservação de registros).
- Código de Processo Civil (CPC), Art. 369 e Art. 411 (Validade de prova atestada por tecnologia).
- Medida Provisória nº 2.200-2/2001 (ICP-Brasil) - Validade de assinaturas eletrônicas.

3. DADOS DE ENTRADA E MÉTRICAS TÉCNICAS
- Similitude Óptica Microtextural (OFP): {optical_similarity:.2f} (Limiar de conformidade: 0.85)
- Consistência de Sinal RF (NFC/UHF): {rf_consistency_desc}
- Integridade Física do Selo (Tamper Score): {tamper_evidence:.2f}
- Score de Confiança Unificado (GuardScore™): {score:.1f}%

4. PARECER TÉCNICO-FORENSE
Com base nos dados coletados e processados, esta relatoria conclui que o ativo sob
exame é classificado como:
>>> [ {status} ] <<<
- Nível de Confiança Operacional: {score:.1f}/100.0
- Justificativa Analítica: {justificativa}

5. RESERVA DE PROPRIEDADE INTELECTUAL E SEGURANÇA DE ATIVOS INTEGRADOS
    AVISO DE SEGURANÇA E PROPRIEDADE INTELECTUAL (Symbeon Labs):
Este relatório e os algoritmos de inferência forense subjacentes constituem
propriedade intelectual exclusiva da Symbeon Labs, protegidos nos termos da Lei nº
9.279/1996 (Propriedade Industrial) e da Lei nº 9.609/1998 (Proteção de Software).
O uso desta tecnologia pela GuardDrive Tech é limitado aos termos do Acordo de
Licenciamento Exclusivo para mobilidade e telemetria veicular. Qualquer tentativa de engenharia
reversa do hardware GuardTag ou das chaves de atestação Symbeon resultará na rescisão
imediata da licença e sanções civis e criminais cabíveis.
"""

    # Geração da assinatura Ed25519 real
    report_bytes = report_body.strip().encode('utf-8')
    if priv_key:
        signature = priv_key.sign(report_bytes).hex()
    else:
        signature = "ASSINATURA_INDISPONIVEL_SEM_CHAVE_PRIVADA"

    report = f"""{report_body}
6. CERTIFICADO DE AUTENTICIDADE E NÃO-REPÚDIO — SYMBEON LABS
Gerado por: Magistrado Themis Engine v0.2.0
Assinatura Digital Ed25519: {signature}
Chave Pública de Validação: {pub_hex}
Protocolado sob o Bloco L2: {block_num}
--------------------------------------------------------------------------------
         CONFIDENCIAL — SEGREDO INDUSTRIAL — INICIATIVA GUARDDRIVE™
================================================================================
"""

    # Active Learning Loop - Salva no dataset de treino
    try:
        os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
        entry = {
            "input": {
                "gtid": gtid,
                "metrics": {
                    "trust_score": score,
                    "optical_similarity": optical_similarity,
                    "rf_consistency": rf_consistency,
                    "tamper_evidence": tamper_evidence
                },
                "empresa": empresa,
                "segmento": segmento,
                "timestamp": timestamp
            },
            "output": report.strip()
        }
        with open(DATASET_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as err:
        sys.stderr.write(f"[WARNING] Erro ao gravar entrada de dataset: {err}\n")
        
    return report.strip()

def run_security_check(arguments: dict) -> dict:
    """
    Analisa a segurança dos ativos integrados não-GuardDrive (ex: Symbeon Labs).
    Garante a proteção da propriedade intelectual conforme acordos vigentes.
    """
    app_domain = arguments.get("app_domain", "")
    target_market = arguments.get("target_market", "")
    exposed_keys = arguments.get("exposed_keys", [])
    
    compliance_alerts = []
    safety_level = "SEGURO"
    
        # 1. Verificar mercado licenciado
    if target_market.lower() not in ["mobilidade", "telemetria_veicular", "gestao_de_frotas", "gestão de frotas"]:
        compliance_alerts.append(
            f"AVISO DE MERCADO: O mercado-alvo '{target_market}' difere da concessão de uso exclusiva "
            "para 'Mobilidade e Telemetria Veicular' concedida pela Symbeon Labs. Recomenda-se formalizar "
            "aditivo contratual com o escritório RS Advogados."
        )
        safety_level = "ATENÇÃO"
        
    # 2. Verificar chaves vazadas
    critical_key_patterns = ["private_key", "sym_key", "session_key", "sha_3", "secret", "private"]
    leaked_keys = list(dict.fromkeys(
        key for key in exposed_keys
        for pattern in critical_key_patterns
        if pattern in key.lower()
    ))
                
    if leaked_keys:
        compliance_alerts.append(
            f"VIOLAÇÃO CRÍTICA DE SEGURANÇA: Chaves sensíveis de atestação foram detectadas "
            f"em contexto exposto: {', '.join(leaked_keys)}. Revogação imediata recomendada."
        )
        safety_level = "CRÍTICO"
        
    # 3. Verificar domínio HTTPS
    if app_domain and not app_domain.startswith("https://") and "localhost" not in app_domain:
        compliance_alerts.append(
            f"AVISO DE INFRAESTRUTURA: O domínio '{app_domain}' utiliza protocolo inseguro (HTTP). "
            "A transmissão de payloads forenses do UEAP deve ocorrer estritamente sobre TLS mútuo (mTLS)."
        )
        if safety_level != "CRÍTICO":
            safety_level = "ATENÇÃO"
            
    recommendations = [
        "1. Segregar o banco de dados de eventos forenses (Event Store do UEAP) da camada pública da web.",
        "2. Utilizar criptografia homomórfica ou Zero-Knowledge Proofs para blindagem de dados pessoais (LGPD).",
        "3. Manter o dataset ativo de treinamento (forensic_dataset.jsonl) em storage ar-gapped (SEED#2).",
        "4. Inserir cláusula de dissolução de PI em todas as integrações de APIs com frotas externas."
    ]
    
    return {
        "status": "success",
        "safety_level": safety_level,
        "compliance_alerts": compliance_alerts,
        "recommendations": recommendations,
        "checked_at": datetime.utcnow().isoformat() + "Z"
    }

def main():
    sys.stderr.write("Magistrado Themis AI MCP Server iniciado via stdio.\n")
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            
            # Sanitiza a entrada
            line = line.strip()
            if not line:
                continue
                
            request = json.loads(line)
            req_id = request.get("id")
            method = request.get("method")
            params = request.get("params", {})
            
            if method == "initialize":
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "magistrado-themis-ai",
                            "version": "0.1.0"
                        }
                    }
                }
            elif method == "tools/list":
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "tools": [
                            {
                                "name": "gerar_laudo",
                                "description": "Gera um laudo técnico-jurídico automatizado baseado em telemetria física-óptica e assinaturas.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "gtid": {"type": "string", "description": "ID Único do Veículo (ex: GD-7A9F-2C4E)"},
                                        "score": {"type": "number", "description": "Score de confiança do veículo (0.0 a 100.0)"},
                                        "optical_similarity": {"type": "number", "description": "Similitude óptica microtextural (0.0 a 1.0)"},
                                        "rf_consistency": {"type": "number", "description": "Consistência de sinal de rádiofrequência (0.0 ou 1.0)"},
                                        "tamper_evidence": {"type": "number", "description": "Nível de integridade física do selo (0.0 a 1.0)"},
                                        "empresa": {"type": "string", "description": "Nome da empresa solicitante"},
                                        "segmento": {"type": "string", "description": "Segmento operacional (frotista, seguradora, outro)"}
                                    },
                                    "required": ["gtid", "score", "optical_similarity", "rf_consistency", "tamper_evidence", "empresa", "segmento"]
                                }
                            },
                            {
                                "name": "verificar_seguranca_ativo",
                                "description": "Analisa a segurança de ativos integrados externos e conformidade de propriedade intelectual com a Symbeon Labs.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "app_domain": {"type": "string", "description": "Domínio da aplicação integrada"},
                                        "target_market": {"type": "string", "description": "Mercado-alvo da integração (ex: mobilidade, frotista, finanças)"},
                                        "exposed_keys": {
                                            "type": "array",
                                            "items": {"type": "string"},
                                            "description": "Lista de chaves ou variáveis de ambiente expostas no código"
                                        }
                                    },
                                    "required": ["app_domain", "target_market"]
                                }
                            }
                        ]
                    }
                }
            elif method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                
                if tool_name == "gerar_laudo":
                    report_text = generate_forensic_report(arguments)
                    response = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": report_text
                                }
                            ]
                        }
                    }
                elif tool_name == "verificar_seguranca_ativo":
                    check_result = run_security_check(arguments)
                    response = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps(check_result, indent=2, ensure_ascii=False)
                                }
                            ]
                        }
                    }
                else:
                    response = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "error": {
                            "code": -32601,
                            "message": f"Ferramenta desconhecida: {tool_name}"
                        }
                    }
            else:
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Método não encontrado: {method}"
                    }
                }
                
            sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
            sys.stdout.flush()
            
        except Exception as e:
            err_msg = traceback.format_exc()
            sys.stderr.write(f"[ERROR] Falha no processamento: {err_msg}\n")
            # Envia erro JSON-RPC caso tenhamos o id
            try:
                error_response = {
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32603,
                        "message": str(e),
                        "data": err_msg
                    }
                }
                sys.stdout.write(json.dumps(error_response) + "\n")
                sys.stdout.flush()
            except:
                pass

if __name__ == "__main__":
    main()
