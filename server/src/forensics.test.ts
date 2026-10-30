import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  executeOrbitCommand,
  getVirtualFile,
  VIRTUAL_FILES,
  SUPPORTED_COMMANDS
} from '@ghost-trace/shared';

describe('Phase 5: GHOST TRACE Forensic Logs Verification', () => {
  const REQUIRED_LOGS = [
    '/logs/auth.log',
    '/logs/firewall.log',
    '/logs/audit.log',
    '/logs/service.log',
    '/logs/mail_queue.log'
  ];

  test('1. Every required investigation log exists and is readable in VFS', () => {
    for (const logPath of REQUIRED_LOGS) {
      const file = getVirtualFile(logPath);
      assert.ok(file, `Virtual log file must exist: ${logPath}`);
      assert.equal(file?.isDirectory, false, `${logPath} must be a regular file`);
      assert.equal(file?.isReadable, true, `${logPath} must be marked isReadable`);
      assert.equal(file?.integrity, 'healthy', `${logPath} must have healthy integrity`);
      assert.ok(file?.content && file.content.length > 100, `${logPath} must contain substantive content`);
    }
  });

  test('2. orbit logs command lists all forensic logs with descriptions and status', () => {
    assert.ok(SUPPORTED_COMMANDS.includes('orbit logs'), 'SUPPORTED_COMMANDS must include orbit logs');

    const result = executeOrbitCommand('orbit logs');
    assert.ok(result.lines.length > 0);
    const text = result.lines.join('\n');

    assert.ok(text.includes('ORBIT CAMPUS FORENSIC & SYSTEM LOG REPOSITORY'));
    for (const logPath of REQUIRED_LOGS) {
      assert.ok(text.includes(logPath), `orbit logs must list ${logPath}`);
    }
    assert.ok(text.includes('READABLE'));
    assert.ok(text.includes('Usage: orbit read <path>'));
  });

  test('3. orbit help documents the orbit logs command', () => {
    const helpResult = executeOrbitCommand('orbit help');
    const helpText = helpResult.lines.join('\n');
    assert.ok(helpText.includes('orbit logs'), 'orbit help must list orbit logs');
  });

  test('4. Each log contains a formatted descriptive header', () => {
    for (const logPath of REQUIRED_LOGS) {
      const readResult = executeOrbitCommand(`orbit read ${logPath}`);
      const text = readResult.lines.join('\n');
      assert.ok(text.includes(`--- START OF FILE: ${logPath} ---`));
      assert.ok(text.includes(`# Log: ${logPath}`), `${logPath} must include # Log header`);
      assert.ok(text.includes('# Description:'), `${logPath} must include # Description header`);
      assert.ok(text.includes('# System:'), `${logPath} must include # System header`);
      assert.ok(text.includes(`--- END OF FILE: ${logPath} ---`));
    }
  });

  test('5. Convenience log path resolution works for orbit logs and orbit read', () => {
    // Calling orbit read without /logs/ prefix
    const readShort = executeOrbitCommand('orbit read auth.log');
    assert.ok(readShort.lines.join('\n').includes('--- START OF FILE: /logs/auth.log ---'));

    // Calling orbit logs with specific file path delegates to log reader
    const logsDirect = executeOrbitCommand('orbit logs /logs/service.log');
    assert.ok(logsDirect.lines.join('\n').includes('--- START OF FILE: /logs/service.log ---'));

    const logsShort = executeOrbitCommand('orbit logs audit.log');
    assert.ok(logsShort.lines.join('\n').includes('--- START OF FILE: /logs/audit.log ---'));
  });

  test('6. Cross-log entity correlation: Attacker external IP and credentials', () => {
    const authLog = getVirtualFile('/logs/auth.log')?.content || '';
    const firewallLog = getVirtualFile('/logs/firewall.log')?.content || '';

    const ATTACKER_IP = '198.51.100.44';
    const COMPROMISED_USER = 'm.turner';
    const AUTH_SESSION = 'SESS-AUTH-9104';

    // Attacker IP in both firewall and auth
    assert.ok(authLog.includes(ATTACKER_IP), 'auth.log must record attacker IP');
    assert.ok(firewallLog.includes(ATTACKER_IP), 'firewall.log must record attacker IP ingress');

    // Failed brute-force followed by successful credential login
    assert.ok(authLog.includes('Failed password for invalid user admin'));
    assert.ok(authLog.includes(`Accepted password for ${COMPROMISED_USER}`));
    assert.ok(authLog.includes(AUTH_SESSION));
  });

  test('7. Cross-log entity correlation: Internal pivot IP and reconnaissance', () => {
    const firewallLog = getVirtualFile('/logs/firewall.log')?.content || '';
    const auditLog = getVirtualFile('/logs/audit.log')?.content || '';
    const serviceLog = getVirtualFile('/logs/service.log')?.content || '';

    const PIVOT_IP = '10.0.40.15';

    // Pivot host IP in firewall port scan, audit database session, and service connection pool
    assert.ok(firewallLog.includes(PIVOT_IP), 'firewall.log must show port scan from pivot IP');
    assert.ok(auditLog.includes(PIVOT_IP), 'audit.log must show DB session from pivot IP');
    assert.ok(serviceLog.includes(PIVOT_IP), 'service.log must show DB connection pool stress from pivot IP');
  });

  test('8. Cross-log timeline correlation: Database query and table corruption', () => {
    const auditLog = getVirtualFile('/logs/audit.log')?.content || '';
    const serviceLog = getVirtualFile('/logs/service.log')?.content || '';

    // Audit log records query then corruption at 20:58:33
    assert.ok(auditLog.includes("SELECT * FROM student_directory WHERE enrollment_status='ACTIVE'"));
    assert.ok(auditLog.includes('20:58:33'));
    assert.ok(auditLog.includes('block 0x48F2'));
    assert.ok(auditLog.includes('/records/students.db'));

    // Service log records crash at 20:58:33
    assert.ok(serviceLog.includes('20:58:33'));
    assert.ok(serviceLog.includes('invalid page checksum'));
    assert.ok(serviceLog.includes('COMPROMISED'));
  });

  test('9. Cross-log timeline correlation: Portal gateway SIGKILL termination', () => {
    const auditLog = getVirtualFile('/logs/audit.log')?.content || '';
    const serviceLog = getVirtualFile('/logs/service.log')?.content || '';

    // Audit shows SIGKILL issued at 21:04:10
    assert.ok(auditLog.includes('21:04:10'));
    assert.ok(auditLog.includes('SIGKILL'));
    assert.ok(auditLog.includes('/services/portal-gateway.pid'));

    // Service shows unit failed and PID unlinked at 21:04:12
    assert.ok(serviceLog.includes('21:04:12'));
    assert.ok(serviceLog.includes('Main process 401 terminated by signal SIGKILL'));
    assert.ok(serviceLog.includes('PID file unlinked'));
    assert.ok(serviceLog.includes('OFFLINE'));
  });

  test('10. Cross-log timeline correlation: Mail queue throttling and GHOST broadcast', () => {
    const mailLog = getVirtualFile('/logs/mail_queue.log')?.content || '';
    const serviceLog = getVirtualFile('/logs/service.log')?.content || '';
    const authLog = getVirtualFile('/logs/auth.log')?.content || '';

    // Mail queue spike at 21:10:30 from ghost@orbit.local
    assert.ok(mailLog.includes('21:10:30'));
    assert.ok(mailLog.includes('ghost@orbit.local'));
    assert.ok(mailLog.includes('890 messages pending'));

    // Throttling at 21:11:45
    assert.ok(mailLog.includes('21:11:45'));
    assert.ok(mailLog.includes('STATUS DEGRADED'));

    // GHOST message dispatch at 21:14:08 across logs
    assert.ok(mailLog.includes('21:14:08'));
    assert.ok(mailLog.includes('msg-ghost-01'));
    assert.ok(mailLog.includes('Well, look who\'s here.'));

    assert.ok(serviceLog.includes('21:14:08'));
    assert.ok(serviceLog.includes('msg-ghost-01'));

    assert.ok(authLog.includes('21:14:08'));
    assert.ok(authLog.includes('GHOST'));
  });

  test('11. Benign baseline events exist in logs and are distinguishable from attack events', () => {
    const authLog = getVirtualFile('/logs/auth.log')?.content || '';
    const firewallLog = getVirtualFile('/logs/firewall.log')?.content || '';
    const auditLog = getVirtualFile('/logs/audit.log')?.content || '';
    const serviceLog = getVirtualFile('/logs/service.log')?.content || '';
    const mailLog = getVirtualFile('/logs/mail_queue.log')?.content || '';

    // Benign cron and routine PAM
    assert.ok(authLog.includes('pam_unix(cron:session)'), 'auth.log must contain normal cron sessions');
    assert.ok(authLog.includes('session closed for user root'), 'auth.log must contain clean session terminations');

    // Benign rule synchronization and staff webmail
    assert.ok(firewallLog.includes('rule synchronization with secondary node fw-edge-02: OK'));
    assert.ok(firewallLog.includes('staff webmail SSO'));

    // Benign integrity check
    assert.ok(auditLog.includes('HASH_OK'));

    // Benign daily log rotation
    assert.ok(serviceLog.includes('Starting Daily log rotation timer logrotate.timer - SUCCESS'));

    // Benign faculty mailing
    assert.ok(mailLog.includes('faculty mailing list processed (48 recipients) - STATUS OK'));
  });

  test('12. Unknown log paths and path traversal return safe diagnostic errors', () => {
    const unknownLog = executeOrbitCommand('orbit read /logs/malicious.log');
    assert.ok(unknownLog.lines[0].includes('File not found in virtual filesystem'));

    const traversalAttempt = executeOrbitCommand('orbit read /logs/../../etc/passwd');
    assert.ok(traversalAttempt.lines[0].includes('File not found in virtual filesystem'));
  });
});
