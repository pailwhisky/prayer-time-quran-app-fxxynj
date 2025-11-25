
# 🚀 Launch Checklist - Apple IAP

Use this checklist to ensure everything is ready before launching your app with subscriptions.

## ✅ Pre-Launch Checklist

### 1. App Store Connect Setup
- [ ] Apple Developer account active and paid
- [ ] App created in App Store Connect
- [ ] Bundle ID matches your app
- [ ] Subscription group created
- [ ] All 4 products created with correct IDs:
  - [ ] `com.prayertimes.islamic.premium.monthly`
  - [ ] `com.prayertimes.islamic.premium.yearly`
  - [ ] `com.prayertimes.islamic.ultra.monthly`
  - [ ] `com.prayertimes.islamic.ultra.yearly`
- [ ] Product descriptions written
- [ ] Product screenshots uploaded
- [ ] Pricing configured for all regions
- [ ] Products submitted for review
- [ ] Products approved by Apple
- [ ] Shared secret generated and saved securely

### 2. Supabase Configuration
- [ ] Project created and active
- [ ] Database tables exist:
  - [ ] `subscription_tiers`
  - [ ] `user_subscriptions`
  - [ ] `subscription_features`
  - [ ] `iap_transactions`
- [ ] RLS policies enabled on all tables
- [ ] Edge Function `verify-apple-receipt` created
- [ ] Edge Function deployed to production
- [ ] Environment variables set:
  - [ ] `APPLE_SHARED_SECRET`
  - [ ] `ENVIRONMENT=production`
- [ ] Edge Function tested and working

### 3. Code Configuration
- [ ] Product IDs match App Store Connect
- [ ] Pricing in database matches App Store
- [ ] `react-native-iap` library installed
- [ ] IAP service initialized in app layout
- [ ] Purchase listeners set up
- [ ] Error handling implemented
- [ ] Demo mode alerts removed (or kept for fallback)
- [ ] All console.logs reviewed (remove sensitive data)

### 4. Testing - Sandbox Environment
- [ ] Sandbox test account created
- [ ] Tested on real iOS device (not simulator)
- [ ] Products load from App Store
- [ ] Purchase flow completes successfully
- [ ] Receipt verification works
- [ ] Subscription activates in database
- [ ] Premium features unlock
- [ ] Restore purchases works
- [ ] Upgrade from Premium to Ultra works
- [ ] Downgrade handled correctly
- [ ] Cancellation flow tested
- [ ] Expired subscription handled
- [ ] Error scenarios tested:
  - [ ] No internet connection
  - [ ] User cancels purchase
  - [ ] Payment fails
  - [ ] Receipt verification fails

### 5. Build Configuration
- [ ] Production build created
- [ ] App signed with distribution certificate
- [ ] Provisioning profile includes IAP capability
- [ ] App version incremented
- [ ] Build number incremented
- [ ] Release notes written

### 6. TestFlight Testing
- [ ] Build uploaded to TestFlight
- [ ] Internal testing completed
- [ ] External beta testers invited
- [ ] Feedback collected and addressed
- [ ] All critical bugs fixed
- [ ] Performance tested on various devices
- [ ] Battery usage acceptable
- [ ] Network usage reasonable

### 7. App Store Submission
- [ ] App metadata complete:
  - [ ] App name
  - [ ] Subtitle
  - [ ] Description (mentions subscriptions)
  - [ ] Keywords
  - [ ] Support URL
  - [ ] Marketing URL
  - [ ] Privacy policy URL (mentions subscriptions)
- [ ] Screenshots for all required sizes
- [ ] App preview video (optional but recommended)
- [ ] Age rating appropriate
- [ ] Category selected
- [ ] Subscription information added to description
- [ ] Test account credentials provided in review notes
- [ ] Review notes explain subscription features

### 8. Legal & Compliance
- [ ] Terms of Service updated
- [ ] Privacy Policy updated (mentions payment data)
- [ ] Subscription terms clearly stated
- [ ] Refund policy documented
- [ ] Auto-renewal clearly disclosed
- [ ] Pricing displayed correctly
- [ ] GDPR compliance (if applicable)
- [ ] CCPA compliance (if applicable)

### 9. Support Infrastructure
- [ ] Support email set up
- [ ] FAQ page created
- [ ] Subscription management instructions written
- [ ] Cancellation instructions documented
- [ ] Refund request process defined
- [ ] Support ticket system ready (optional)

### 10. Monitoring & Analytics
- [ ] Supabase dashboard access configured
- [ ] Database monitoring set up
- [ ] Edge Function logs accessible
- [ ] Error tracking configured
- [ ] Analytics events defined:
  - [ ] Subscription modal opened
  - [ ] Product selected
  - [ ] Purchase initiated
  - [ ] Purchase completed
  - [ ] Purchase failed
  - [ ] Restore initiated
  - [ ] Feature accessed
- [ ] Revenue tracking set up
- [ ] Conversion funnel defined

## 🧪 Testing Scenarios Checklist

### Happy Path
- [ ] New user subscribes to Premium monthly
- [ ] New user subscribes to Premium yearly
- [ ] New user subscribes to Ultra monthly
- [ ] New user subscribes to Ultra yearly
- [ ] Premium user upgrades to Ultra
- [ ] User restores purchase after reinstall
- [ ] Subscription auto-renews successfully

### Error Scenarios
- [ ] User cancels during payment
- [ ] Payment method declined
- [ ] No internet connection during purchase
- [ ] Receipt verification fails
- [ ] Database update fails
- [ ] User tries to access locked feature
- [ ] Subscription expires
- [ ] User tries to purchase while already subscribed

### Edge Cases
- [ ] Multiple devices with same account
- [ ] Rapid subscription changes
- [ ] Purchase during app update
- [ ] Subscription during poor network
- [ ] Very old app version
- [ ] Jailbroken device (should still work)

## 📊 Launch Day Checklist

### Morning of Launch
- [ ] All systems operational
- [ ] Supabase project healthy
- [ ] Edge Functions responding
- [ ] Database backups recent
- [ ] Support team briefed
- [ ] Monitoring dashboards open

### During Launch
- [ ] Monitor real-time subscriptions
- [ ] Watch for error spikes
- [ ] Check Edge Function logs
- [ ] Monitor support requests
- [ ] Track conversion rates
- [ ] Watch for crashes

### First 24 Hours
- [ ] Review all transactions
- [ ] Check for failed verifications
- [ ] Respond to support tickets
- [ ] Monitor user feedback
- [ ] Check App Store reviews
- [ ] Verify revenue tracking

### First Week
- [ ] Analyze conversion funnel
- [ ] Review error logs
- [ ] Optimize based on data
- [ ] Address common issues
- [ ] Update FAQ if needed
- [ ] Plan improvements

## 🔍 Quality Assurance Checklist

### UI/UX
- [ ] Subscription modal looks good on all devices
- [ ] Pricing displays correctly
- [ ] Buttons are tappable
- [ ] Loading states show appropriately
- [ ] Success messages clear
- [ ] Error messages helpful
- [ ] Navigation smooth
- [ ] Animations performant

### Functionality
- [ ] All features work as expected
- [ ] Premium gates function correctly
- [ ] Subscription status updates in real-time
- [ ] Profile shows correct tier
- [ ] Features unlock immediately after purchase
- [ ] Restore works reliably
- [ ] Cancellation handled gracefully

### Performance
- [ ] App launches quickly
- [ ] IAP initialization doesn't block UI
- [ ] Product loading fast
- [ ] Purchase flow smooth
- [ ] No memory leaks
- [ ] Battery usage normal
- [ ] Network usage efficient

### Security
- [ ] Receipts verified server-side
- [ ] No sensitive data in logs
- [ ] RLS policies working
- [ ] Shared secret secure
- [ ] API calls use HTTPS
- [ ] User data protected

## 📝 Documentation Checklist

### User-Facing
- [ ] In-app help text
- [ ] Subscription FAQ
- [ ] How to cancel guide
- [ ] How to restore guide
- [ ] Feature comparison chart
- [ ] Pricing page
- [ ] Terms of service
- [ ] Privacy policy

### Internal
- [ ] Setup guide complete
- [ ] Architecture documented
- [ ] API documentation
- [ ] Database schema documented
- [ ] Troubleshooting guide
- [ ] Runbook for common issues
- [ ] Monitoring guide

## 🎯 Success Metrics

Define your targets:
- [ ] Target conversion rate: ____%
- [ ] Target monthly subscribers: _____
- [ ] Target yearly subscribers: _____
- [ ] Target MRR: $_____
- [ ] Target churn rate: ____%
- [ ] Target support tickets: _____

## 🚨 Rollback Plan

In case of critical issues:
- [ ] Rollback procedure documented
- [ ] Previous version available
- [ ] Database migration rollback tested
- [ ] Communication plan ready
- [ ] Support team knows procedure

## 📞 Emergency Contacts

- [ ] Apple Developer Support: _____________
- [ ] Supabase Support: _____________
- [ ] Your team lead: _____________
- [ ] On-call engineer: _____________

## ✅ Final Sign-Off

Before submitting to App Store:

- [ ] All checklist items completed
- [ ] All tests passing
- [ ] No known critical bugs
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Legal approved
- [ ] Team sign-off

**Signed off by:**
- Developer: _________________ Date: _______
- QA: _________________ Date: _______
- Product: _________________ Date: _______

---

## 🎉 Post-Launch

After successful launch:
- [ ] Celebrate! 🎊
- [ ] Monitor for 48 hours
- [ ] Collect user feedback
- [ ] Plan next iteration
- [ ] Document lessons learned

---

**Good luck with your launch!** 🚀

Remember: It's better to delay launch and get it right than to rush and have issues.

**Questions?** Review the setup guides or contact support.
