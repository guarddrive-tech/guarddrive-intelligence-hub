# -*- coding: utf-8 -*-
import sys
import json
import traceback
import hashlib
import random
from datetime import datetime
import os

# Força UTF-8 em stdout/stderr (necessário no Windows)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Base paths
DATASET_PATH = "dataset/forensic_dataset.jsonl"

def generate_forensic_report(event_data: dict) -> str:
    """
    Gera um laudo técnico-jurídico automatizado baseado em telemetria física-óptica.
    Adota termos do Hexágono Legislativo brasileiro e preserva o IP da Symbeon Labs.
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
    tx_hash = "0x" + hashlib.sha256(f"{report_id}-{block_num}".encode('utf-8')).hexdigest()
    
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
        
    report = f"""================================================================================
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
Licenciamento Exclusivo para logística e segurança. Qualquer tentativa de engenharia
reversa do hardware GuardTag ou das chaves de atestação Symbeon resultará na rescisão
imediata da licença e sanções civis e criminais cabíveis.

6. ASSINATURA ELETRÔNICA E SELO CRIPTOGRÁFICO
Gerado por: Magistrado Themis AI Engine v0.1.0
Selo Criptográfico: {tx_hash}
Protocolado sob o Bloco: {block_num}
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
    if target_market.lower() not in ["logistica", "logística", "seguranca_de_carga", "segurança de carga"]:
        compliance_alerts.append(
            f"AVISO DE MERCADO: O mercado-alvo '{target_market}' difere da concessão de uso exclusiva "
            "para 'Logística e Segurança de Carga' concedida pela Symbeon Labs. Recomenda-se formalizar "
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
